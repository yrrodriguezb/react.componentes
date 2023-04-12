import Button  from '@mui/material/Button';
import { useState } from 'react';

import TablaFiltroBase, { DatosEmitidos } from './componentes/Base/TablaFiltroBase'
import TablaFiltro from'./componentes/Base/TablaFiltro';
import Autocompletar, { AutocompletarProps } from './componentes/Base/Autocompletar'
import countryList from './tests/data/countries';
import DataSource from './interfaces/base/datasource';
import { Divider, Typography } from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}
export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}
export interface Geo {
  lat: string;
  lng: string;
}
export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}


function App() {
  const [open, setOpen] = useState(false)

  function createData(
    value: string,
    text: string
  ): DataSource {
    return {
      value,
      text
    };
  }

  const data = [
    createData("01", "Cupcake"),
    createData("0101", "Donut"),
    createData("010101", "Eclair"),
    createData("010102", "Frozen yoghurt"),
    createData("02", "Gingerbread"),
    createData("0202", "Honeycomb"),
    createData("020201", "Ice cream sandwich"),
    createData("020202", "Jelly Bean"),
    createData("020203", "KitKat"),
    createData("03", "Lollipop"),
    createData("0301", "Marshmallow"),
    createData("030101", "Nougat"),
    createData("030102", "Oreo")
  ];

  let autocopmpletarProps1: AutocompletarProps = {
    clearable: true,
    returnObject: true,
    iconElement: () => <ArrowDropDown />,
    inputProps: {
      color: 'secondary',
      size: 'medium',
      label: 'Show',
      focused: true,
      placeholder: 'Buscar programa ...'
    },
    service: {
      url:'https://api.tvmaze.com/search/shows/', // ?q=girls, excecuteOnce
      dataText:'name',
      dataValue:'id',
      searchParam: 'q',
      toDataSource: (data: any[], returnObject) => {
        return data.map((d: any) => {
          const { show } = d;
          let user:any = { text: show.name, value: show.id }

          if (returnObject)
            user.original = d;

          return user;
        })
      }
    },
    onSelected:  console.log
  }

  let autocopmpletarProps2: AutocompletarProps = {
    clearable: true,
    service: {
      url:'https://jsonplaceholder.typicode.com/users', // ?q=girls, excecuteOnce
      dataText:'email',
      dataValue:'id',
      executeOnce: true
    },
    returnObject: true,
    onSelected: (d: DataSource<User>) => {
      console.log(d.original)
    },
    panelWidth: '400px'
  }

  let autocopmpletarProps3: AutocompletarProps = {
    clearable: true,
    data: countryList,
    renderText: function (o: DataSource | any) {
        return  `[Value]: ${o.value} - [Text]: ${o.text} - [Full]: ${o.value} - ${o.text}`;
    },
    inputProps: {
      placeholder: 'Buscar pais ...'
    },
    onSelected: console.log
  }

  const replacer = (key:any, value: any) => {
    if (key === "onSelected") {
      return  "console.log"
    } else if (key === "toDataSource" && value != null) {
      return "(data: any[], returnObject: boolean): DataSource[] => { ... }"
    } else if (key === "renderText" && value != null) {
      return "(obj: DataSource | any): string => {}"
    } else if (key === "data" && value != null) {
      return "[ ...countries ]"
    } else if (key === "iconElement"){
      return "() => JSX.Element"
    }
    return value
   }


  return (
    <>
      {/* <Button variant='contained' onClick={ () => { setOpen(true) }}>Open</Button>


      <TablaFiltro
        urlService='https://jsonplaceholder.typicode.com/posts'
        dataValue='id'
        dataText='title'
        inDialog
        onSelected={(d: DatosEmitidos) => { console.log(d) }}
        onClose={() => { setOpen(false) }}
        title="POSTS json placeholder"
        open={open}
      /> */}

      {/* <TablaFiltroBase
        data={data}
        onClose={() => { setOpen(false); } }
        onSelected={(d: DatosEmitidos) => { console.log(d); } }
        open={open}
        title="Centros de Costos"
        returnAsString
      /> */}

      <Typography variant='h6'>Con Servicio que se ejecuta al escribir:</Typography>

      <Autocompletar
        { ...autocopmpletarProps1 }
      />

      <pre>{JSON.stringify(autocopmpletarProps1, replacer, 2)}</pre>
      <br />

      <Typography variant='h6'>Servicio que se ejecuta una vez</Typography>
      <Autocompletar
        { ...autocopmpletarProps2 }
      />
      <pre>{JSON.stringify(autocopmpletarProps2, replacer, 2)}</pre>
      <br />

      <Typography variant='h6'>Con Datos Fijos</Typography>
      <Autocompletar
        { ...autocopmpletarProps3 }
      />
      <pre>{JSON.stringify(autocopmpletarProps3, replacer, 2)}</pre>
      <br />

      <Typography variant='h6'>Datos APP</Typography>
      <pre>
        {
          JSON.stringify(__AYF__, replacer, 4)
        }
      </pre>
    </>
  );
}

export default App;


