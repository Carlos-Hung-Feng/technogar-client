import {
  Box,
  Button,
  IconButton,
  Modal,
  Typography,
  useTheme,
} from "@mui/material";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import * as React from "react";
import { tokens } from "../theme";

const CustomModal = ({
  buttonIcon,
  open,
  setOpen,
  onClick,
  message,
  onSubmit,
  submitButtonText,
  disableBackdropClick = false,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleClose = (event, reason) => {
    if (reason !== "backdropClick" || !disableBackdropClick) {
      setOpen(false);
    }
  };
  return (
    <div>
      {buttonIcon && (
        <IconButton type="button" onClick={onClick}>
          {buttonIcon}
        </IconButton>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: colors.primary[500],
            borderRadius: "30px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h3" fontWeight={"bold"}>
            {message.header}
          </Typography>
          <Typography
            id="modal-modal-description"
            fontSize={"15px"}
            sx={{ mt: 2, mb: 2 }}
          >
            {message.body}
          </Typography>
          <Box display={"flex"} justifyContent={"end"}>
            <Button color="secondary" variant="contained" onClick={onSubmit}>
              {submitButtonText}
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default CustomModal;
