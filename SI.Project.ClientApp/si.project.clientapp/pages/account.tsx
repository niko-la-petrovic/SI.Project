import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { MdDrafts, MdExpandMore, MdInbox } from "react-icons/md";

import CreateCertForm from "../components/organisms/create-cert-form";
import { toast } from "react-toastify";

export default function Account() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <h1>Account</h1>
      <Accordion>
        <AccordionSummary
          expandIcon={<MdExpandMore />}
        >
          <Typography className="text-xl">Create a certificate</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className="flex flex-col gap-4">
            <div>This will ...</div>
            <CreateCertForm />
          </div>
        </AccordionDetails>
      </Accordion>

      {/* TODO remove */}
      {/* <button
        onClick={() => {
          toast("Hello World", {
            type: "success",
            autoClose: false,
            closeOnClick: false,
            closeButton: false,
            draggable: false,
          });
        }}
      >
        toast
      </button> */}
    </div>
  );
}
