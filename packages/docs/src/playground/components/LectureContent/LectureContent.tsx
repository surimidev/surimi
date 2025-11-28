import './LectureContent.css';

export interface LectureContentProps {
  title: string;
  content: string;
  currentIndex: number;
  totalLectures: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function LectureContent({
  title,
  content,
  currentIndex,
  totalLectures,
  onPrevious,
  onNext,
}: LectureContentProps) {
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalLectures - 1;

  return (
    <div className="lecture-content">
      <div className="lecture-content__header">
        <h2>{title}</h2>
        <div className="lecture-content__progress">
          Lecture {currentIndex + 1} of {totalLectures}
        </div>
      </div>

      <div className="lecture-content__body">
        {/* This div will be rendered by Astro with the markdown content */}
        <div className="lecture-content__markdown" dangerouslySetInnerHTML={{ __html: content }} />
      </div>

      <div className="lecture-content__navigation">
        <button className="lecture-content__nav-button" onClick={onPrevious} disabled={!hasPrevious} type="button">
          ← Previous
        </button>
        <button className="lecture-content__nav-button" onClick={onNext} disabled={!hasNext} type="button">
          Next →
        </button>
      </div>
    </div>
  );
}
