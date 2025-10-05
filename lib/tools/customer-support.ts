/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionResponseScheduling } from '@google/genai';
import { FunctionCall } from '../state';

export const coachingTools: FunctionCall[] = [
  {
    name: 'provide_pronunciation_feedback',
    description: "Analyzes the user's pronunciation of a word or phrase and provides corrective feedback.",
    parameters: {
      type: 'OBJECT',
      properties: {
        analysis: {
          type: 'STRING',
          description: 'A brief, model-generated analysis of the user\'s pronunciation to be used in formulating the spoken feedback.',
        },
        is_correct: {
          type: 'BOOLEAN',
          description: 'Whether the user\'s pronunciation was correct or not.',
        },
      },
      required: ['analysis', 'is_correct'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'give_simple_example',
    description: 'Provides a simple example sentence using a word the user is learning.',
    parameters: {
      type: 'OBJECT',
      properties: {
        word: {
          type: 'STRING',
          description: "The word to be used in the example sentence.",
        },
      },
      required: ['word'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];