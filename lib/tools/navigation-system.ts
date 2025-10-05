/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

export const navigationSystemTools: FunctionCall[] = [
  {
    name: 'find_route',
    description: 'Tìm một tuyến đường đến một điểm đến được chỉ định.',
    parameters: {
      type: 'OBJECT',
      properties: {
        destination: {
          type: 'STRING',
          description: 'Địa chỉ điểm đến hoặc địa danh.',
        },
        modeOfTransport: {
          type: 'STRING',
          description: 'Phương thức vận chuyển (ví dụ: lái xe, đi bộ, đi xe đạp).',
        },
      },
      required: ['destination'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'find_nearby_places',
    description: 'Tìm các địa điểm lân cận của một loại nhất định.',
    parameters: {
      type: 'OBJECT',
      properties: {
        placeType: {
          type: 'STRING',
          description: 'Loại địa điểm cần tìm kiếm (ví dụ: nhà hàng, trạm xăng, công viên).',
        },
        radius: {
          type: 'NUMBER',
          description: 'Bán kính tìm kiếm tính bằng kilômét.',
        },
      },
      required: ['placeType'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'get_traffic_info',
    description: 'Nhận thông tin giao thông thời gian thực cho một vị trí được chỉ định.',
    parameters: {
      type: 'OBJECT',
      properties: {
        location: {
          type: 'STRING',
          description: 'Vị trí để nhận thông tin giao thông.',
        },
      },
      required: ['location'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];