import { Box, Button, List, ListItem, Popper, TextField } from "@mui/material";
import { useState } from "react";
import { Autocompletar } from "./componentes";
import React from "react";



function App() {

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  return (
    <>

      <Autocompletar
        data={[
          { text: "Uno", value: 1 },
          { text: "Uno", value: 2 },
          { text: "Uno", value: 3 },
          { text: "Uno", value: 4 },
          { text: "Uno", value: 5 }
        ]}
        multiple
      />

      {/* <TextField
        sx={{
          position: 'fixed',
          left: "50%",
          top: "50%",

        }}
        onClick={asignarElemento}
      /> */}


      {/* <Popper open={false} anchorEl={ anchorEl } >
        <List sx={{ boxShadow: 10, background: '#FFF' }}>
          <ListItem key={ 1 }> Valor de uno </ListItem>
          <ListItem key={ 2 }> Valor de uno </ListItem>
          <ListItem key={ 3 }> Valor de uno </ListItem>
          <ListItem key={ 4 }> Valor de uno </ListItem>
          <ListItem key={ 5 }> Valor de uno </ListItem>
        </List>
      </Popper>

      */}


{/* <div>
      <Button
       aria-describedby={id} type="button" onClick={handleClick}  sx={{
          position: 'fixed',
          left: "50%",
          top: "50%",

        }}>
        Toggle Popper
      </Button>
      <Popper id={id} open={open} anchorEl={anchorEl}>
        <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
          The content of the Popper.
        </Box>
      </Popper>
    </div> */}
    </>
  );
}


export default App;


