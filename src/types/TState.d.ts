import { TKeyboard } from "./TKeyboard";
import { TLetter } from "./TLetter";
import { TTake } from "./TTake";

export type TState = {
	takes: Array<TTake>;
	letters: Array<TLetter>;
	activeLetter: Letter;
	activeTakeId: string;
	deleteNext: boolean;
	inputNext: boolean;
	message: boolean;
	wordGuessed: boolean;
	dailyWord: Array<{ id: string; value: string; letterCount: number }>;
	word: string;
	keyboard: TKeyboard;
	hardMode: boolean;
	isPropaginating: boolean;
};
