import { DataSource } from "../interfaces"


export const isDataSource = (obj: any) => {
  return toString.call({}) === toString.call(obj) && (obj.hasOwnProperty('text') && obj.hasOwnProperty('value'))
}

export const convertToDataSource = (data: any[]) => {
  if (data.length) {
    if (!isDataSource(data[0])) {
      return data.map((element: any) => {
        return { text: element, value: element } as DataSource
      })
    }
  }

  return data || [];
}

export const isSameDatasource = (x: DataSource, y: DataSource) => {
  return x.id === y.id && x.value === y.value && x.text === y.text;
}
