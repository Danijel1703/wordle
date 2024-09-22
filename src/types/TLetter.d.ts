export type TLetter = {
	id: string;
	domId: string;
	value: string;
	isCorrect: boolean;
	consists: boolean;
	takeId: string;
	ref: RefObject<HTMLInputElement>;
};
