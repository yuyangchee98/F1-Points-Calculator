import React from 'react';
import {
  PAGE_HEAD_CLASS,
  PAGE_HEAD_EYEBROW_CLASS,
  PAGE_HEAD_TITLE_CLASS,
  PAGE_HEAD_ACTIONS_CLASS,
} from './pageHeadClasses';

interface Props {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  /** Sits left of the title block — a flag, an avatar. */
  leading?: React.ReactNode;
  /** Right-aligned; wraps under the title on narrow screens. */
  actions?: React.ReactNode;
  as?: 'h1' | 'h2';
}

/** React twin of PageHead.astro — see ./pageHeadClasses.ts. */
const PageHead: React.FC<Props> = ({ title, eyebrow, leading, actions, as: Heading = 'h1' }) => (
  <div className={PAGE_HEAD_CLASS}>
    <div className="flex items-center gap-3 min-w-0">
      {leading}
      <div className="min-w-0">
        {eyebrow && <div className={PAGE_HEAD_EYEBROW_CLASS}>{eyebrow}</div>}
        <Heading className={PAGE_HEAD_TITLE_CLASS}>{title}</Heading>
      </div>
    </div>
    {actions && <div className={PAGE_HEAD_ACTIONS_CLASS}>{actions}</div>}
  </div>
);

export default PageHead;
