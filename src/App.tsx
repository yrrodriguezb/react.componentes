import { Autocompletar } from "./componentes";


function App() {
  return (
    <>
      <Autocompletar
        service={{
          url: "https://jsonplaceholder.typicode.com/users",
          dataId: "id",
          dataValue: "id",
          dataText: "name",
          executeOnce: true,
          executeOnFirstFocus: true
        }}
        onSelected={ console.log }
      />
    </>
  );
}

export default App;
