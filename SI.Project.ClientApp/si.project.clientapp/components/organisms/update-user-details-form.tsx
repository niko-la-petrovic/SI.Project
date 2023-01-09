import * as yup from "yup";

import {
  Button,
} from "@mui/material";
import { useFormik } from "formik";

const validationSchema = yup.object({

});

export default function UpdateUserDetailsForm() {
  const formik = useFormik({
    initialValues: {},
    validationSchema,
    onSubmit: (values) => {},
  });

  return (
    <div className="flex flex-col gap-y-8">
      <form onSubmit={formik.handleSubmit}>
        <div className="flex flex-col gap-y-8 w-full md:w-[420px]">
          <Button color="primary" variant="contained" type="submit">
            Update
          </Button>
        </div>
      </form>
    </div>
  );
}
