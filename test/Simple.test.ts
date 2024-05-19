import assert from 'node:assert';
import { Debouncer } from '@/lib';

function delay(time: number): Promise<void> {
	return new Promise<void>(resolve => {
		setTimeout(resolve, time);
	});
}

// TODO: add more tests

describe('lib > Simple', () => {
	it('create and execute a debounced operation', async () => {
		let timesExecuted = 0;
		const operation = () => {
			timesExecuted += 1;
		};

		const debounce = new Debouncer(operation, 50);

		debounce.exec();
		assert.strictEqual(timesExecuted, 0);

		await delay(50);
		assert.strictEqual(timesExecuted, 1);
	});
});
