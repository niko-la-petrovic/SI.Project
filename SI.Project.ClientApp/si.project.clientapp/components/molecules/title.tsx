import { MdBiotech, MdOutlineSecurity } from "react-icons/md";

export default function Title() {
  return (
    <div className="flex gap-x-2 items-center">
      <MdOutlineSecurity className="text-white bg-primary rounded-lg p-1 text-5xl" />
      <span className="text-3xl font-bold">SNI</span>
    </div>
  );
}
