/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './WelcomeScreen.css';
import { useTools, communicationTopics } from '../../../lib/state';

const WelcomeScreen: React.FC = () => {
  const { topic } = useTools();
  const selectedTopic = communicationTopics.find(t => t.id === topic) || communicationTopics[0];
  const { title, description, prompts } = selectedTopic;

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="title-container">
          <span className="welcome-icon">mic</span>
          <h2 className="welcome-title">{title}</h2>
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