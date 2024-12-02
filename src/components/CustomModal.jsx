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
  onClickButton_1,
  buttonText_1,
  buttonColor_1 = "secondary",
  onClickButton_2,
  buttonText_2,
  buttonColor_2 = "error",
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
          <Typography
            id="modal-modal-title"
            component={"span"}
            variant="h3"
            fontWeight={"bold"}
          >
            {message.header}
          </Typography>
          <Box padding={"20px 0px"}>{message.body}</Box>
          <Box display={"flex"} gap={1} justifyContent={"end"}>
            {onClickButton_2 && (
              <Button
                color={buttonColor_2}
                variant="contained"
                onClick={onClickButton_2}
              >
                {buttonText_2}
              </Button>
            )}
            <Button
              color={buttonColor_1}
              variant="contained"
              onClick={onClickButton_1}
            >
              {buttonText_1}
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default CustomModal;
