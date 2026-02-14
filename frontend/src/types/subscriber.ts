export interface Subscriber {
	_id: string;
	email: string;
	subscribedAt: string;
}

export interface FetchSubscribersResponse {
	success: boolean;
	count: number;
	subscribers: Subscriber[];
}

export interface SendAnnouncementPayload {
	subject: string;
	text: string;
	html?: string;
}

export interface SendAnnouncementResponse {
	success: boolean;
	message: string;
	totalSubscribers: number;
	successful: number;
	failed: number;
}
