import * as React from 'react';
import ItemForm from './components/ItemForm';

const App = () => {
  const [isFolded, setIsFolded] = React.useState(false);

  function toggleFold() {
    setIsFolded(!isFolded);
  }
  
  return (
    <div>
      <div className='p-fixed br container z-top fold' style={{marginBottom:'30px'}} hidden={!isFolded} onClick={toggleFold}>&lt;</div>
      <div className='p-fixed br container z-top' style={{marginBottom:'30px'}} hidden={isFolded}>
        <b>SkyPlanner WikiTools</b>
        <ItemForm disabled={isFolded} />
        <div className='fold p-absolute tr' onClick={toggleFold} style={{float:'right'}}>&gt;</div>
      </div>
    </div>
  );
};

export default App;