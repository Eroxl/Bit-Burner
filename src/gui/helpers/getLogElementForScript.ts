/**
 * Get a scripts log element.
 * @returns Log element or undefined
 */
const getLogElementForScript = (name: string, args: string[]) => {
  const doc = eval("document") as Document;

  const logAreas = [...doc.querySelectorAll(".react-draggable .react-resizable")]

  const logArea = logAreas.find((logArea) => {
    const logAreaName = logArea.querySelector(".drag")?.textContent;

    if (!logAreaName) return false;

    return logAreaName === `${name} ${args.join(" ")}`;
  });

  return logArea;
};

export default getLogElementForScript;
