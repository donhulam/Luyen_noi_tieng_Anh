/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

export const personalAssistantTools: FunctionCall[] = [
  {
    name: 'create_calendar_event',
    description: 'Tạo một sự kiện mới trong lịch của người dùng.',
    parameters: {
      type: 'OBJECT',
      properties: {
        summary: {
          type: 'STRING',
          description: 'Tiêu đề hoặc tóm tắt của sự kiện.',
        },
        location: {
          type: 'STRING',
          description: 'Địa điểm của sự kiện.',
        },
        startTime: {
          type: 'STRING',
          description: 'Thời gian bắt đầu của sự kiện ở định dạng ISO 8601.',
        },
        endTime: {
          type: 'STRING',
          description: 'Thời gian kết thúc của sự kiện ở định dạng ISO 8601.',
        },
      },
      required: ['summary', 'startTime', 'endTime'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'send_email',
    description: 'Gửi email đến một người nhận được chỉ định.',
    parameters: {
      type: 'OBJECT',
      properties: {
        recipient: {
          type: 'STRING',
          description: 'Địa chỉ email của người nhận.',
        },
        subject: {
          type: 'STRING',
          description: 'Dòng chủ đề của email.',
        },
        body: {
          type: 'STRING',
          description: 'Nội dung chính của email.',
        },
      },
      required: ['recipient', 'subject', 'body'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'set_reminder',
    description: 'Đặt lời nhắc cho người dùng.',
    parameters: {
      type: 'OBJECT',
      properties: {
        task: {
          type: 'STRING',
          description: 'Nhiệm vụ cho lời nhắc.',
        },
        time: {
          type: 'STRING',
          description: 'Thời gian cho lời nhắc ở định dạng ISO 8601.',
        },
      },
      required: ['task', 'time'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];