/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './WelcomeScreen.css';
import { useTools, communicationTopics, TopicId } from '../../../lib/state';

const topicsByCategory = communicationTopics.reduce((acc, topic) => {
  if (!acc[topic.category]) {
    acc[topic.category] = [];
  }
  acc[topic.category].push(topic);
  return acc;
}, {} as Record<string, typeof communicationTopics>);


const WelcomeScreen: React.FC = () => {
  const { topic, setTopic } = useTools();
  const selectedTopic = communicationTopics.find(t => t.id === topic) || communicationTopics[0];
  const { description, prompts } = selectedTopic;

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="title-container">
          <span className="welcome-icon">mic</span>
          <div className="title-selector">
            <select value={topic} onChange={(e) => setTopic(e.target.value as TopicId)} aria-label="Chọn một chủ đề">
              {Object.entries(topicsByCategory).map(([category, topics]) => (
                <optgroup label={category} key={category}>
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span className="icon">arrow_drop_down</span>
          </div>
        </div>
        <p>{description}</p>
        <div className="example-prompts">
          {prompts.map((prompt, index) => (
            <div key={index} className="prompt">{prompt}</div>
          ))}
        </div>
        <div className="creator-credit">
          Tạo bởi: Đỗ Như Lâm, Zalo: 0911 855 646
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;