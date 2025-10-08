export interface VideoFormat {
    formatId: string;
    resolution: string;
    ext: string;
}
export interface VideoInfoResponse {
    title: string;
    thumbnail: string;
    duration: number;
    formats: VideoFormat[];
}
export interface GetVideoInfoRequestBody {
    url: string;
}