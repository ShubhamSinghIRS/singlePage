import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import BasicTable from './table';


function App() {
  const [count, setCount] = useState(0)
  // const [topDropDown , setTopDropDown] = useState('');
  // const keys = ['Functional','Technical','Strategy','Personal', 'Site-Visits']


  return (
    <>
    <BasicTable/>
    </>
  )
}

export default App
