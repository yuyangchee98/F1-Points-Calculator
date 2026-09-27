import React from 'react';
import { SECTION_LABEL_CLASS, SECTION_LABEL_HINT_CLASS } from './pageHeadClasses';

interface Props {
  children: React.ReactNode;
  hint?: React.ReactNode;
  as?: 'h2' | 'h3' | 'div';
}

const SectionLabel: React.FC<Props> = ({ children, hint, as: Tag = 'h2' }) => (
  <div className={SECTION_LABEL_CLASS}>
    <Tag>{children}</Tag>
    {hint && <span className={SECTION_LABEL_HINT_CLASS}>{hint}</span>}
  </div>
);

export default SectionLabel;
