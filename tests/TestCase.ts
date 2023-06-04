import { err, ok } from '../src';
import { waitPlease } from './testUtils';

type TestCaseOptions = { testOption: string };

export class TestCase {
  constructor(private options: TestCaseOptions, private abortController?: AbortController) {}

  // case factory
  static create(options?: TestCaseOptions) {
    return new TestCase(options || { testOption: 'once' }, new AbortController());
  }

  async execute(runParams: { runParam: number }) {
    if (this.aborted()) {
      return err(new Error('Aborted'));
    }

    await waitPlease(10);

    if (this.aborted()) {
      return err(new Error('Aborted'));
    }

    switch (this.options.testOption) {
      case 'once':
        return ok(`Once - ${runParams.runParam}`);
      case 'double':
        return ok(`Double - ${runParams.runParam * 2}`);
      case 'triple':
        return ok(`Triple - ${runParams.runParam * 3}`);
      default:
        return err(new Error('Invalid testOption value'));
    }
  }

  onAbort() {
    this.abortController?.abort();
  }

  private aborted() {
    return this.abortController?.signal.aborted;
  }
}
