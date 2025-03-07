import numpy as np
from scipy.optimize import linear_sum_assignment

class CentroidTracker:
    def __init__(self, max_disappeared=50, max_distance=50, on_object_removed=None):
        ###
        #   Initializes the CentroidTracker with parameters for managing object tracking.
        #
        #   Args:
        #       max_disappeared (int): Maximum number of frames an object can be missing before deregistering.
        #       max_distance (int): Maximum distance between centroids to consider them the same object.
        ###
        self.next_id = 0
        self.objects = {}
        self.disappeared = {}
        self.max_disappeared = max_disappeared
        self.max_distance = max_distance
        self.on_object_removed = on_object_removed

    def update(self, detections):
        ###
        #   Updates the tracker with new detections.
        #
        #   Args:
        #       detections (list): List of bounding boxes (x1, y1, x2, y2).
        #
        #   Returns:
        #       dict: Updated dictionary of tracked objects with bounding boxes and centroids.
        ###
        
        if len(detections) == 0:
            self._update_disappeared()
            return self.objects
        
        # Calculate centroids
        centroids = np.array([[(x1 + x2)/2, (y1 + y2)/2] for (x1, y1, x2, y2) in detections])
        
        if len(self.objects) == 0:
            for bbox, centroid in zip(detections, centroids):
                self._add_object(bbox, centroid)
        else:
            object_ids = list(self.objects.keys())
            object_centroids = [data[1] for data in self.objects.values()]#list(self.objects.values())
            
            # Calculate pairwise distances
            distance_matrix = np.linalg.norm(object_centroids - centroids[:, np.newaxis], axis=2)
            
            # Apply Hungarian algorithm
            row_ind, col_ind = linear_sum_assignment(distance_matrix)
            
            matched = set()
            for (row, col) in zip(row_ind, col_ind):
                if distance_matrix[row, col] > self.max_distance:
                    continue
                
                object_id = object_ids[col]
                self.objects[object_id] = (detections[row], centroids[row])
                self.disappeared[object_id] = 0
                matched.add(row)
            
            # Handle unmatched existing objects
            unmatched = set(range(len(centroids))).difference(matched)
            for row in unmatched:
                self._add_object(detections[row], centroids[row])
            
            # Handle disappeared objects
            self._update_disappeared()
            # Handle disappeared objects
            removed_objects = self._update_disappeared()
            
            return self.objects, removed_objects

    def _add_object(self, bbox, centroid):
        ###
        #   Adds a new object to the tracker.
        #
        #   Args:
        #       bbox (tuple): The bounding box of the new object.
        #       centroid (tuple): The centroid of the new object.
        ###
        self.objects[self.next_id] = (bbox, centroid)
        self.disappeared[self.next_id] = 0
        self.next_id += 1

    def _update_disappeared(self):
        ###
        #   Updates the disappeared count for each object and deregisters if necessary.
        #   Returns:
        #       list: List of object IDs that were removed in this update.
        ###
        to_delete = []
        for object_id in self.disappeared:
            self.disappeared[object_id] += 1
            if self.disappeared[object_id] > self.max_disappeared:
                to_delete.append(object_id)
        
        removed_objects = []
        for object_id in to_delete:
            # Save object data before deletion for the callback
            if object_id in self.objects:
                removed_objects.append(object_id)
            # Delete the object
            del self.objects[object_id]
            del self.disappeared[object_id]

            # Call the callback if provided
            if self.on_object_removed and object_id in removed_objects:
                self.on_object_removed(object_id)

        return removed_objects