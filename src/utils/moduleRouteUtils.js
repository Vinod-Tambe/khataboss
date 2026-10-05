/** Props for nested <Routes> so content remounts when the URL changes (fixes stale page on sidebar nav). */
export const nestedRoutesProps = (location) => ({
  location,
  key: location.pathname,
});
