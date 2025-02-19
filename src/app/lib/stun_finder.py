import requests
import math
from aiortc import RTCIceServer

class ClosestStunServer():
    def __init__(self):

        # URLs for fetching data
        self.GEO_LOC_URL = "https://raw.githubusercontent.com/pradt2/always-online-stun/master/geoip_cache.txt"
        self.IPV4_URL = "https://raw.githubusercontent.com/pradt2/always-online-stun/master/valid_ipv4s.txt"
        self.GEO_USER_URL = "https://geolocation-db.com/json/"

    def fetch_json(self, url):
        """Fetch JSON data from a URL."""
        self.response = requests.get(url)
        self.response.raise_for_status()
        return self.response.json()

    def fetch_text(self, url):
        """Fetch text data from a URL."""
        self.response = requests.get(url)
        self.response.raise_for_status()
        return self.response.text

    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate the Euclidean distance between two points."""
        return math.sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2)

    def find_closest_stun_server(self):
        # Fetch geolocation data
        geo_locs = self.fetch_json(self.GEO_LOC_URL)

        # Fetch user's latitude and longitude
        user_location = self.fetch_json(self.GEO_USER_URL)
        latitude = user_location['latitude']
        longitude = user_location['longitude']

        # Fetch list of valid IPv4 addresses for STUN servers
        ipv4_list = self.fetch_text(self.IPV4_URL).strip().split('\n')

        # Calculate the closest STUN server
        closest_addr = min(
            ipv4_list,
            key=lambda addr: self.calculate_distance(
                latitude,
                longitude,
                *geo_locs[addr.split(':')[0]]
            )
        )

        return closest_addr

class GetStunServers():
    def __init__(self):
        self.STUN_SERVERS_URL = "https://raw.githubusercontent.com/pradt2/always-online-stun/master/valid_hosts.txt"
        self.iceServers = [
            RTCIceServer("stun:stun.l.google.com:19302"),
            RTCIceServer(
                "turn:relay1.expressturn.com:3478",
                username="efQSLPKFVR1ANJGAHL",
                credential="p1CPPouohCkB1MO2"
            ),
            RTCIceServer("stun:stun.relay.metered.ca:80"),
    
            RTCIceServer( "turn:global.relay.metered.ca:80",
                username="0a3a9293f3f8dd410138e0fb",
                credential="JAYpV4YyYPL7JwX+"
            ),
            RTCIceServer("turn:global.relay.metered.ca:80?transport=tcp",
                username="0a3a9293f3f8dd410138e0fb",
                credential="JAYpV4YyYPL7JwX+"
            ),
            RTCIceServer("turn:global.relay.metered.ca:443",
                username="0a3a9293f3f8dd410138e0fb",
                credential="JAYpV4YyYPL7JwX+"
            ),
            RTCIceServer( "turns:global.relay.metered.ca:443?transport=tcp",
                username="0a3a9293f3f8dd410138e0fb",
                credential="JAYpV4YyYPL7JwX+"
            ),
        ]
        self.stun_servers = self.fetch_stun_servers(self.STUN_SERVERS_URL)
        self.append_stun_servers(self.iceServers, self.stun_servers)
    def fetch_stun_servers(self, url):
        """
        Fetches a list of STUN server hosts from a given URL.

        Args:
            url (str): The URL to fetch the STUN server list from.

        Returns:
            list: A list of STUN server hosts.
        """
        response = requests.get(url)
        response.raise_for_status()
        return response.text.strip().split('\n')

    def append_stun_servers(self, ice_servers, stun_servers):
        """
        Appends STUN servers to the iceServers list.

        Args:
            ice_servers (list): The list of RTCIceServer objects to append to.
            stun_servers (list): The list of STUN server hosts to append.
        """
        for host in stun_servers:
            ice_servers.append(RTCIceServer(f"stun:{host}"))
        return ice_servers



# if __name__ == "__main__":
#     closest_stun_server = find_closest_stun_server()
#     print(f"The closest STUN server is: {closest_stun_server}")