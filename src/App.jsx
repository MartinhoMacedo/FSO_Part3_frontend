import { useState, useEffect } from 'react'
import personsService from './services/persons'

const ErrorMessage = ({message}) => {
  const errorMessageStyle = {
      color: 'red',
      backgroundColor: 'lightGrey',
      fontSize: 20,
      borderStyle: 'solid',
      borderRadius: 5,
      padding: 10,
      marginBottom: 10
  }

  if (message === null) return null

  return(
    <div style={errorMessageStyle}>
      {message}
    </div>
  )
}

const Notification = ({message}) => {

  const notificationStyle = {
    color: 'green',
    backgroundColor: 'lightGrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }

  if (message === null) return null

  return (
    <div style={notificationStyle}>
      {message}
    </div>
  )
}

const DeleteButton = ({person, setPersons, persons, setErrorMessage}) => {
  const deleteClick = () => {

    if(!window.confirm(`Delete ${person.name} ?`)){
      return
    }

    personsService.deleteEntry(person.id).then(
      removedPerson => {
        setPersons(
          persons.toSpliced(
            persons.findIndex(tempPerson => tempPerson.id === person.id), 1
          )
        )
      }
    ).catch(error => {
      setErrorMessage(`Information of ${person.name} already been removed from server`)
    })
  }

  return <button onClick={deleteClick}>Delete</button>
}

const Person = ({person, persons, setPersons, setErrorMessage}) =>
      <div>
        {person.name} {person.number} <DeleteButton
                                        person={person}
                                        setPersons={setPersons}
                                        persons={persons}
                                        setErrorMessage={setErrorMessage}
                                      />
      </div>

const Persons = ({persons, newSearch, setPersons, setErrorMessage}) =>{
  const tempPersons = newSearch === '' ? persons :
        persons.filter(person => person.name.toLowerCase().includes(newSearch.toLowerCase()))
  return <div>
           {tempPersons.map(person =>
             <Person
               person={person}
               setPersons={setPersons}
               persons={persons}
               key={person.name}
               setErrorMessage={setErrorMessage}
             />
           )}
        </div>
}

const Filter = ({newSearch, setNewSearch}) => {

  const handleSearchChange = (event) => {
    setNewSearch(event.target.value)
  }

  return(
    <div>
      filter shown with
      <input
        value={newSearch}
        onChange={handleSearchChange}
      />
    </div>
  )
}

const PersonForm = ({newName, newNumber, setNewName, setNewNumber}) => {
  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange= (event) => {
    setNewNumber(event.target.value)
  }

  return (
    <div>
      <div>
      name: <input
              value={newName}
              onChange={handleNameChange}
            />
      </div>
      <div>
      number: <input
              value={newNumber}
              onChange={handleNumberChange}
            />
      </div>
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newSearch, setNewSearch] = useState('')
  const [notification, setNotification] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect( () => {
    console.log('effect')
    personsService.getAll()
      .then(allPersons => {
        console.log('promise fulfilled')
        setPersons(allPersons)
      })

  },[])

  const nameNotUsed = (name) => persons.every((person) =>{
    return person.name != name
  })


  const addName = (event) => {
    event.preventDefault()
    const personObject = {name: newName,
                          number: newNumber
                         }
    const personIdx = persons.findIndex(tempPerson => tempPerson.name === newName)

    if(nameNotUsed(newName)){
      personsService.create(personObject).then(
        newPersons => {
          setPersons(persons.concat(newPersons))
          setNewName('')
          setNewNumber('')

          setNotification(`Added ${newName}`)
          setTimeout(() => {
            setNotification(null)
          }, 2000)
        }
      ).catch(error => {
        setErrorMessage(error.response.data.error)
        setTimeout(() => {
            setErrorMessage(null)
          }, 2000)
      })
      return
    }

    if(!window.confirm(`${newName} is already added to phonebook, replace the old number
with a new one?`)) return

    personsService.update(persons[personIdx].id, personObject).then(
      updatedPerson => {
        setPersons(persons.toSpliced(personIdx, 1, updatedPerson))
        setNewName('')
        setNewNumber('')
        setNotification(`Updated ${newName} number`)
        setTimeout(() => {
          setNotification(null)
        }, 2000)
      }
    ).catch(error => {
      setErrorMessage(`Information of ${newName} already been removed from server`)
      setTimeout(() => {
          setErrorMessage(null)
        }, 2000)
    })
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message = {notification}/>
      <ErrorMessage message = {errorMessage}/>
      <Filter newSearch={newSearch} setNewSearch={setNewSearch}/>
      <form onSubmit={addName}>
      <h3>Add a new</h3>
        <PersonForm
          newName={newName}
          newNumber={newNumber}
          setNewName={setNewName}
          setNewNumber={setNewNumber}
        />
        <div> <button type="submit">add</button> </div>
      </form>
      <h3>Numbers</h3>
      <Persons
        persons={persons}
        newSearch={newSearch}
        setPersons={setPersons}
        setErrorMessage={setErrorMessage}
      />
    </div>
  )
}

export default App
