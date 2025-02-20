import os
from googleapiclient.http import MediaFileUpload
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow


class MyGoogleApi():
    def __init__(self):
        super().__init__()
        self.CLIENT_SECRET_FILE = 'client_secret_567402999419-37os4r0v021q8jlpmnjt0a87ijrqmkvk.apps.googleusercontent.com.json'
        self.API_NAME = 'drive'
        self.API_VERSION = 'v3'
        self.SCOPES = ['https://www.googleapis.com/auth/drive.file']

        # Authenticate and create the service
        self.service = self.authenticate()

    def authenticate(self):
        """Authenticate using OAuth2 and return the Drive service."""
        creds = None
        token_file = 'token.json'

        # Load existing credentials if available
        if os.path.exists(token_file):
            creds = Credentials.from_authorized_user_file(token_file, self.SCOPES)

        # If no valid credentials, prompt user to log in
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.CLIENT_SECRET_FILE, self.SCOPES
                )
                creds = flow.run_local_server(port=0)

            # Save credentials for future use
            with open(token_file, 'w') as token:
                token.write(creds.to_json())

        return build(self.API_NAME, self.API_VERSION, credentials=creds)

    async def upload(self, file_directory, file_name, file_type, folder_id, delete_local=True):#type='video/mp4'    '1jfdeg-r2M8eaxiqIVyGiy9dfYD4eN8b6'
        """
        Uploads a file to Google Drive and deletes it from local storage after successful upload.

        Args:
            file_directory (str): The folder containing the file (e.g., "recordings").
            file_name (str): The name of the file (e.g., "video.mp4").
            file_type (str): The MIME type of the file (e.g., "video/mp4").
            folder_id (str): The Google Drive folder ID to upload the file to.
            delete_local (bool): Delete local file after upload. Defaults to True.

        Returns:
            str: The uploaded file's ID if successful, else None.
        """
        try:
            # Construct relative path
            base_dir = os.path.dirname(os.path.abspath(__file__))  # Get script's directory
            relative_path = os.path.join(base_dir, file_directory, file_name)  # Join paths correctly
            if not os.path.exists(relative_path):
                raise FileNotFoundError(f"File not found: {relative_path}")
            file_metadata = {
                'name': file_name,
                'parents': [folder_id]
            }
            media_content = MediaFileUpload(
                relative_path, 
                mimetype=file_type,
                resumable=True
                )
            print(f"Uploading {file_name} ...")
            file = self.service.files().create(
                body=file_metadata,
                media_body=media_content
            ).execute()
            file_id = file.get('id')
            print(f"Uploaded {file_type.split('/')[0].capitalize()} successfully with file_id: {file_id}")#{'kind': 'drive#file', 'id': file_id, 'name': name, 'mimeType': 'video/mp4'}
            if delete_local:
                self.delete(relative_path)
            return file_id
        except Exception as e:
            print(f"Failed to upload {file_name}: {e}")
            return None
    def delete(self, file_path):
        """Deletes the local file after a successful upload."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"Deleted local file: {file_path}")
            else:
                print(f"File not found for deletion: {file_path}")
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")

# if __name__ == "__main__":
#     sign_in = MyGoogleApi()
#     print(f"Sign in result: {sign_in}")