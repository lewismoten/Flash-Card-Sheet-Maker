export const getAnchorStyle = (config) => {
  const style = config?.anchors?.style ?? 'bold-color';
  const color = config?.anchors?.color ?? '#8B0000';

  return {
    useBold: style === 'bold' || style === 'bold-color',
    useColor: style === 'color' || style === 'bold-color',
    color,
  };
};