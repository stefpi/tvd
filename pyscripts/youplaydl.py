import os
import json
import youtube_dl
import google_auth_oauthlib.flow
import googleapiclient.discovery
import googleapiclient.errors
import sys

scopes = ["https://www.googleapis.com/auth/youtube.readonly"]


def getplaylist():
    # playlistlink = input("Enter playlist link: ")
    playlistlink = str(sys.argv[1])

    global playId
    playId = playlistlink.split("list=")[1]


def download(vid):
    ydl_opts = {}
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download(['https://www.youtube.com/watch?v={}'.format(vid)])


def getvideos():
    api_service_name = "youtube"
    api_version = "v3"
    key = str(sys.argv[2])

    youtube = googleapiclient.discovery.build(api_service_name, api_version, developerKey=key)

    request = youtube.playlistItems().list(
        part="snippet,contentDetails",
        maxResults=25,
        playlistId=playId
    ).execute()

    response = json.dumps(request, indent=4, sort_keys=True)
    responsejson = json.loads(response)

    iteration = 0
    videoinfo = []

    for x in responsejson["items"]:
        videoinfo.append({"title": x["snippet"]["title"], "id": x["contentDetails"]["videoId"]})
        iteration += 1

    print(json.dumps(videoinfo))
#         print("{}. {}".format(iteration, x["snippet"]["title"]))


#     finalI = iteration
#     print("{}. Download All Videos".format(finalI))
#
#     iteration = 1
#     while iteration != 0:
#         pvid = int(input("\nEnter list number of video (0 to quit): ")) - 1
#
#         if pvid == finalI:
#             for x in responsejson["items"]:
#                 download(x["contentDetails"]["videoId"])
#                 print("\n")
#             break
#         elif int(pvid) == 0:
#             exit()
#         else:
#             download(responsejson["items"][pvid]["contentDetails"]["videoId"])


if __name__ == "__main__":
    getplaylist()
    getvideos()


