import { RefObject } from "react";

export type TTake = {
	id: string;
	domId: string;
	letterIds: Array<string>;
	isSubmitted: boolean;
	ref: RefObject<HTMLInputElement>;
};
