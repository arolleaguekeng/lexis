import { Injectable } from '@angular/core';
import { AiGenericPromptService } from '../ai-generic-prompt.service';
import { VISUAL_EXAMPLES_SECTION_PROMPT } from './prompts/visual-examples-section.prompt';

@Injectable({
  providedIn: 'root',
})
export class VisualExamplesSectionService extends AiGenericPromptService {
  constructor() {
    super();
  }

  async generateDatas(
    history: string,
    projectDescription: string
  ): Promise<{ content: string, summary: string }> {
    const prompt = ` ${VISUAL_EXAMPLES_SECTION_PROMPT} ${projectDescription}.`;

    return this.sendPrompt(history, prompt);
  }
}
