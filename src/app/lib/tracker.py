import numpy as np
from scipy.optimize import linear_sum_assignment

class CentroidTracker:
    def init(self, max_disappeared=50, max_distance=50):
        self.next_id = 0
        self.objects = {}
        self.disappeared = {}
        self.max_disappeared = max_disappeared
        self.max_distance = max_distance

    def update(self, detections):
        # detections: list of (x1, y1, x2, y2) bounding boxes
        
        if len(detections) == 0:
            self._update_disappeared()
            return self.objects
        
        # Calculate centroids
        centroids = np.array([[(x1 + x2)/2, (y1 + y2)/2] for (x1, y1, x2, y2) in detections])
        
        if len(self.objects) == 0:
            for centroid in centroids:
                self._add_object(centroid)
        else:
            object_ids = list(self.objects.keys())
            object_centroids = list(self.objects.values())
            
            # Calculate pairwise distances
            distance_matrix = np.linalg.norm(object_centroids - centroids[:, np.newaxis], axis=2)
            
            # Apply Hungarian algorithm
            row_ind, col_ind = linear_sum_assignment(distance_matrix)
            
            matched = set()
            for (row, col) in zip(row_ind, col_ind):
                if distance_matrix[row, col] > self.max_distance:
                    continue
                
                object_id = object_ids[col]
                self.objects[object_id] = centroids[row]
                self.disappeared[object_id] = 0
                matched.add(row)
            
            # Handle unmatched existing objects
            unmatched = set(range(len(centroids))).difference(matched)
            for row in unmatched:
                self._add_object(centroids[row])
            
            # Handle disappeared objects
            self._update_disappeared()
            
        return self.objects

    def _add_object(self, centroid):
        self.objects[self.next_id] = centroid
        self.disappeared[self.next_id] = 0
        self.next_id += 1

    def _update_disappeared(self):
        to_delete = []
        for object_id in self.disappeared:
            self.disappeared[object_id] += 1
            if self.disappeared[object_id] > self.max_disappeared:
                to_delete.append(object_id)
        
        for object_id in to_delete:
            del self.objects[object_id]
            del self.disappeared[object_id]