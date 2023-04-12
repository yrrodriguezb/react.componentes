import React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import CloseIcon from '@mui/icons-material/Close';
import { useState } from "react";
import DataSource from "../../interfaces/base/datasource";



export type DatosEmitidos = string | string[] | DataSource[];

interface TablaFiltroHeaderProps {
  allowSelectAll?: boolean,
  numSelected: number,
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void,
  rowCount: number,
  headers?: string[]
}

const TablaFiltroHeader = (inProps: TablaFiltroHeaderProps) => {
  const {
    headers = [],
    onSelectAllClick,
    numSelected,
    rowCount,
  } = inProps;

  return (
    <TableHead>
      <TableRow>
        {headers.map((cellText, index) => (
          <TableCell
            key={`${cellText}-${index}`}
            align="center"
            padding="normal"
          >
            { cellText }
          </TableCell>
        ))}
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

interface TablaFiltroToolbarProps {
  title?: string;
  onClose?: () => void;
}

const TablaFiltroToolbar = (inProps: TablaFiltroToolbarProps) => {
  const {
    title = '',
    onClose = () => {}
  } = inProps;

  return (
    <Toolbar component="nav" sx={{ pl: { sm: 2 },pr: { xs: 1, sm: 1 } }}>
      <Typography
        sx={{ flex: "1 1 100%" }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        { title }
      </Typography>

      <Tooltip title="Cerrar">
        <IconButton onClick={onClose} role="btnCloseTable">
          <CloseIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}

export interface TablaFiltroBaseProps {
  data: DataSource[],
  headers?: string[],
  inDialog?: boolean,
  onClose?: () => void,
  onSelected?: (data: DatosEmitidos) => void,
  open?: boolean,
  returnAsString?: boolean,
  title?: string,
}

export const TablaFiltroBase = function TablaFiltroBase(inProps: TablaFiltroBaseProps) {
  const defaultHeaders: string[] = ['Codigo', 'Descripción']

  const {
    data = [],
    headers = defaultHeaders,
    inDialog = false,
    onClose = () => {},
    onSelected = (data: DatosEmitidos) => {},
    open = false,
    returnAsString = false,
    title,
    ...props
  } = inProps;

  const [selected, setSelected] = useState<readonly any[]>([]);
  //const [ , setHidden ] = useState<boolean>((!open))
  const styles: React.CSSProperties = {
    display: open ? 'block' : 'none',
    opacity: !open ? 0 : 1,
    transition: "all 0.7s ease"
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.map((n) => n.value);
      setSelected(newSelected);

      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: any[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (name: string) => {
    return selected.indexOf(name) !== -1;
  };

  const handleSelected = () => {
    if (returnAsString) {
      const strSelected = selected.join(',');
      onSelected(strSelected);
      return;
    }

    onSelected(selected as DatosEmitidos);
  }

  const handleClose = () => {
    onClose();
    //setHidden(true)
    handleSelected();
  }

  const TablaFiltroBase = () => {
    return (
      <Box
        sx={{ width: "100%" }}
        style={styles}
      >
        <Paper>
          <TablaFiltroToolbar title={title} onClose={handleClose} />

          <TableContainer>
            <Table
              sx={{ maxHeight: 440, minWidth: 400 , paddingX: 2, paddingY: 4   }}
              stickyHeader
              size="small"
            >
              <TablaFiltroHeader
                numSelected={selected.length}
                onSelectAllClick={handleSelectAllClick}
                rowCount={data.length}
                headers={headers}
              />
              <TableBody>
                {
                  data.map(row => {
                    const isItemSelected = isSelected(row.value);

                    return (
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, row.value)}
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.value}
                        selected={isItemSelected}
                        role="tbody-row"
                      >
                        <TableCell>{row.value}</TableCell>
                        <TableCell>{row.text}</TableCell>
                        <TableCell padding="checkbox">
                          <Checkbox color="primary" checked={isItemSelected} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    );
  };

  if (inDialog) {
    return (
      <Dialog
        open
        style={styles}
        { ...props }
      >
          <TablaFiltroBase />
      </Dialog>

    );
  }

  return (
    <div style={styles}  { ...props }>
      <TablaFiltroBase />
    </div>
  );
}

export default TablaFiltroBase;

TablaFiltroToolbar.displayName = "AyfTablaFiltroToolbar";
TablaFiltroBase.displayName = "AyfTablaFiltroBase";

