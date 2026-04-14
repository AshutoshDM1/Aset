import './PageLoader.css';

const PageLoader = () => {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader__mark" aria-hidden />
      <span className="sr-only">Loading</span>
    </div>
  );
};

export default PageLoader;
