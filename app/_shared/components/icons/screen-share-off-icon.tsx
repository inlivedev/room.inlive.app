import type { SVGElementPropsType } from '@/_shared/types/types';

export default function ScreenShareOffIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentcolor"
        d="M4.25 4h15.5A2.25 2.25 0 0 1 22 6.25v11.5A2.25 2.25 0 0 1 19.75 20H4.25A2.25 2.25 0 0 1 2 17.75V6.25A2.25 2.25 0 0 1 4.25 4Zm5.03 4.215a.75.75 0 0 0-1.06 1.06l2.72 2.72l-2.72 2.725a.75.75 0 0 0 1.06 1.06L12 13.057l2.724 2.723a.75.75 0 1 0 1.06-1.06l-2.723-2.724l2.723-2.715a.75.75 0 1 0-1.06-1.062l-2.723 2.717l-2.72-2.72Z"
      />
    </svg>
  );
}
