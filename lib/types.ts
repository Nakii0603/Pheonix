export interface Costume {
  _id?: string;
  imageUrl: string;
  createdAt: Date;
  likes: number;
  dislikes: number;
}

export interface Vote {
  _id?: string;
  imageId: string;
  action: "like" | "dislike";
  timestamp: Date;
  deviceId: string;
}
