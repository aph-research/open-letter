import React from 'react';

interface FootnoteReferenceProps {
  number: number;
}

interface Footnote {
  number: number;
  content: React.ReactNode;
}

interface FootnotesSectionProps {
  footnotes: Footnote[];
}

// Component for footnote reference in text (the superscript number)
export const FootnoteReference: React.FC<FootnoteReferenceProps> = ({ number }) => {
  const scrollToFootnote = () => {
    const footnote = document.getElementById(`footnote-${number}`);
    if (footnote) {
      footnote.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#footnote-${number}`}
      onClick={(e) => {
        e.preventDefault();
        scrollToFootnote();
      }}
      className="text-blue-400 hover:text-blue-300 no-underline"
    >
      <sup>{number}</sup>
    </a>
  );
};

// Component for the footnote section after the letter
export const FootnotesSection: React.FC<FootnotesSectionProps> = ({ footnotes }) => {
  return (
    <div className="text-sm font-light">
      {footnotes.map((footnote) => (
        <div
          key={footnote.number}
          id={`footnote-${footnote.number}`}
          style={{ paddingLeft: '3em', position: 'relative' }}
          className="mb-4"
        >
          <span
            style={{ position: 'absolute', left: 0, top: 0 }}
          >
            [{footnote.number}]
          </span>
          <span>{footnote.content}</span>
        </div>
      ))}
    </div>
  );
};