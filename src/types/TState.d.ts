export type TState = {
	takes: Array<Take>;
	letters: Array<Letter>;
	activeLetter: Letter;
	activeTakeId: string;
	deleteNext: boolean;
	inputNext: boolean;
	message: boolean;
	wordGuessed: boolean;
	dailyWord: Array<{ id: string; value: string; letterCount: number }>;
	word: string;
	keyboard: Keyboard;
	hardMode: boolean;
	isPropaginating: boolean;
};
