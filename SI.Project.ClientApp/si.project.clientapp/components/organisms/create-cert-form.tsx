import * as yup from "yup";

import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { CertStoreActionType, CertStoreContext } from "../../store/cert-store";

import { DateTimePicker } from "@mui/x-date-pickers";
import { addYears } from "date-fns";
import forge from "node-forge";
import { saveAs } from "file-saver";
import { useContext } from "react";
import { useFormik } from "formik";

const validationSchema = yup.object({
  keyLength: yup.number().oneOf([2048, 4096]).required("Required"),
  commonName: yup.string().required("Required"),
  countryName: yup.string().required("Required"),
  stateOrProvinceName: yup.string().required("Required"),
  localityName: yup.string().required("Required"),
  organizationName: yup.string().required("Required"),
  organizationalUnitName: yup.string().required("Required"),
  emailAddress: yup
    .string()
    .email("Invalid email address")
    .required("Required"),
  notBefore: yup.date().required("Required"),
  notAfter: yup.date().required("Required"),
});

export default function CreateCertForm() {
  const formik = useFormik({
    initialValues: {
      keyLength: 2048,
      commonName: "Common Name",
      countryName: "BA",
      stateOrProvinceName: "RS",
      localityName: "Banja Luka",
      organizationName: "Organization Name",
      organizationalUnitName: "Organizational Unit Name",
      emailAddress: "nikola@petrovic.com",
      notBefore: new Date(),
      notAfter: addYears(new Date(), 1),
    },
    validationSchema,
    onSubmit: (values) => {
      const {
        commonName,
        countryName,
        stateOrProvinceName,
        localityName,
        organizationName,
        organizationalUnitName,
        emailAddress,
        notBefore,
        notAfter,
        keyLength,
      } = values;

      const keyPair = forge.pki.rsa.generateKeyPair(keyLength);
      const pubKey = keyPair.publicKey;
      const privKey = keyPair.privateKey;

      const cert = forge.pki.createCertificate();
      cert.publicKey = pubKey;
      cert.privateKey = privKey;
      cert.serialNumber = "01";
      cert.validity.notBefore = notBefore;
      cert.validity.notAfter = notAfter;
      cert.validity.notAfter.setFullYear(
        cert.validity.notBefore.getFullYear() + 1
      );
      const attrs = [
        {
          name: "commonName",
          value: commonName,
        },
        {
          name: "countryName",
          value: countryName,
        },
        {
          shortName: "ST",
          value: stateOrProvinceName,
        },
        {
          name: "localityName",
          value: localityName,
        },
        {
          name: "organizationName",
          value: organizationName,
        },
        {
          shortName: "OU",
          value: organizationalUnitName,
        },
      ];
      cert.setSubject(attrs);
      cert.setIssuer(attrs);
      cert.setExtensions([
        {
          name: "basicConstraints",
          cA: false,
        },
        {
          name: "keyUsage",
          keyCertSign: false,
          digitalSignature: true,
          nonRepudiation: true,
          keyEncipherment: true,
          dataEncipherment: true,
        },
        {
          name: "extKeyUsage",
          serverAuth: true,
          clientAuth: true,
          codeSigning: true,
          emailProtection: true,
          timeStamping: true,
        },
        {
          name: "nsCertType",
          client: true,
          server: true,
          email: true,
          objsign: true,
          sslCA: true,
          emailCA: true,
          objCA: true,
        },
        {
          name: "subjectAltName",
          altNames: [
            {
              type: 1, // RFC 822 type - email address
              value: emailAddress,
            },
          ],
        },
        {
          name: "subjectKeyIdentifier",
        },
      ]);
      cert.sign(privKey, forge.md.sha256.create());

      var pem = {
        privateKey: forge.pki.privateKeyToPem(keyPair.privateKey),
        publicKey: forge.pki.publicKeyToPem(keyPair.publicKey),
        certificate: forge.pki.certificateToPem(cert),
      };

      // TODO useContext to save the certificate/pub/priv keys

      saveAs(new Blob([pem.certificate]), "certificate.pem");
      saveAs(new Blob([pem.privateKey]), "privateKey.pem");
      saveAs(new Blob([pem.publicKey]), "publicKey.pem");

      console.log(pem.privateKey);
      console.log(pem.publicKey);
      console.log(pem.certificate);

      certStoreDispatch({
        type: CertStoreActionType.SET_PEM_CERT,
        cert: pem.certificate,
      });
      certStoreDispatch({
        type: CertStoreActionType.SET_PEM_CERT_PRIVATE_KEY,
        certPrivateKey: pem.privateKey,
      });
    },
  });

  const { state: certStoreState, dispatch: certStoreDispatch } =
    useContext(CertStoreContext);

  return (
    <div className="flex flex-col gap-y-8">
      <form onSubmit={formik.handleSubmit}>
        <div className="flex flex-col gap-y-8 w-full md:w-[420px]">
          <FormControl>
            <InputLabel>Key Length</InputLabel>
            <Select
              name="keyLength"
              label="Key Length"
              value={formik.values.keyLength}
              onChange={formik.handleChange}
              error={
                formik.touched.keyLength && Boolean(formik.errors.keyLength)
              }
            >
              <MenuItem value={2048}>2048</MenuItem>
              <MenuItem value={4096}>4096</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="commonName"
            label="Common Name"
            value={formik.values.commonName}
            onChange={formik.handleChange}
            error={
              formik.touched.commonName && Boolean(formik.errors.commonName)
            }
            helperText={formik.touched.commonName && formik.errors.commonName}
          />
          <TextField
            name="countryName"
            label="Country"
            value={formik.values.countryName}
            onChange={formik.handleChange}
            error={
              formik.touched.countryName && Boolean(formik.errors.countryName)
            }
            helperText={formik.touched.countryName && formik.errors.countryName}
          />
          <TextField
            name="stateOrProvinceName"
            label="State or Province"
            value={formik.values.stateOrProvinceName}
            onChange={formik.handleChange}
            error={
              formik.touched.stateOrProvinceName &&
              Boolean(formik.errors.stateOrProvinceName)
            }
            helperText={
              formik.touched.stateOrProvinceName &&
              formik.errors.stateOrProvinceName
            }
          />
          <TextField
            name="localityName"
            label="Locality (city/town)"
            value={formik.values.localityName}
            onChange={formik.handleChange}
            error={
              formik.touched.localityName && Boolean(formik.errors.localityName)
            }
            helperText={
              formik.touched.localityName && formik.errors.localityName
            }
          />
          <TextField
            name="organizationName"
            label="Organization Name"
            value={formik.values.organizationName}
            onChange={formik.handleChange}
            error={
              formik.touched.organizationName &&
              Boolean(formik.errors.organizationName)
            }
            helperText={
              formik.touched.organizationName && formik.errors.organizationName
            }
          />
          <TextField
            name="organizationalUnitName"
            label="Organizational Unit Name"
            value={formik.values.organizationalUnitName}
            onChange={formik.handleChange}
            error={
              formik.touched.organizationalUnitName &&
              Boolean(formik.errors.organizationalUnitName)
            }
            helperText={
              formik.touched.organizationalUnitName &&
              formik.errors.organizationalUnitName
            }
          />
          <TextField
            name="emailAddress"
            label="Email Address"
            value={formik.values.emailAddress}
            onChange={formik.handleChange}
            error={
              formik.touched.emailAddress && Boolean(formik.errors.emailAddress)
            }
            helperText={
              formik.touched.emailAddress && formik.errors.emailAddress
            }
          />
          <DateTimePicker
            label="Not Before"
            value={formik.values.notBefore}
            onChange={(value) => {
              formik.setFieldValue(
                "notBefore",
                value instanceof Date ? value : undefined
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                name="notBefore"
                error={
                  formik.touched.notBefore && Boolean(formik.errors.notBefore)
                }
              />
            )}
          />
          <DateTimePicker
            label="Not After"
            value={formik.values.notAfter}
            onChange={(value) => {
              formik.setFieldValue(
                "notAfter",
                value instanceof Date ? value : undefined
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                name="notAfter"
                error={
                  formik.touched.notAfter && Boolean(formik.errors.notAfter)
                }
              />
            )}
          />
          <Button color="primary" variant="contained" type="submit">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
