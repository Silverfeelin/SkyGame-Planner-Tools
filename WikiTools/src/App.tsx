import * as React from 'react';
import ItemForm from './components/ItemForm';
import TreeForm from './components/TreeForm';

const App = () => {
  const [activeComp, setActiveComp] = React.useState('');

  function toggleFold(type: string) {
    setActiveComp(type || '');
  }
  
  return (
    <div>
      <div className='p-fixed br container z-top fold' style={{marginBottom:'30px'}} hidden={!!activeComp}>
        <div className='' onClick={() => toggleFold('I')}>I</div>
        <div className='' onClick={() => toggleFold('T')}>T</div>
      </div>
      <div className='p-fixed br container z-top' style={{marginBottom:'30px'}} hidden={!activeComp}>
        <b>SkyPlanner WikiTools</b>
        <div hidden={activeComp!=='I'}>
          <ItemForm disabled={activeComp!=='I'} />
        </div>
        <div hidden={activeComp!=='T'}>
          <TreeForm/>
        </div>
        <div className='fold p-absolute tr' onClick={() => toggleFold('')} style={{float:'right'}}>&gt;</div>
      </div>
    </div>
  );
};

export default App;