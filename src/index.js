document.addEventListener('DOMContentLoaded', () => {
  let quoteId
  const list = document.querySelector('#quote-list')
  let onOff = false
  const form = document.querySelector('#new-quote-form')
  const sort = document.createElement('div')
  const sortBtn = document.createElement('button')
  sort.innerText = 'Sort by author:'
  sortBtn.innerText = 'Off'
  document.querySelector('h1').appendChild(sort).appendChild(sortBtn)

  fetchQuote(onOff)

  sortBtn.addEventListener("click", () => {
    onOff = !onOff
    list.innerHTML = ''
    if (sortBtn.innerText === 'Off') {
      sortBtn.innerText = 'On'
      fetchQuote(onOff)
    } else {
      sortBtn.innerText = 'Off'
      fetchQuote(onOff)
    }
    setTimeout(() => {
      managePage()
    }, 200)
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const newQuote = document.querySelector('#new-quote')
    const newAuthor = document.querySelector('#author')
    const newQuoteObj = {
      'quote': newQuote.value,
      'author': newAuthor.value
    }
    postNewQuote(newQuoteObj)
    form.reset()
    location.reload()
  })
  setTimeout(() => {
    managePage()
  }, 200)
})

function managePage() {
  const block = document.getElementsByClassName('blockquote')
  Array.from(block).forEach((card) => {
    card.addEventListener('click', (e) => {
      const card = e.target.parentNode.parentNode
      quoteId = parseInt(card.id)
      if (e.target.className === 'btn-danger') {
        e.target.parentNode.parentNode.remove()
        deleteQuote(quoteId)
      } else if (e.target.className === 'btn-success') {
        const likeObj = {
          'quoteId': quoteId
        }
        postLike(likeObj)
        e.target.querySelector('span').innerText = parseInt(e.target.querySelector('span').innerText) + 1
      } else if (e.target.className === 'edit') {
        editQuote(e, quoteId)
      }
    })
  })
}

function fetchQuote(onOff) {
  fetch('http://localhost:3000/quotes?_embed=likes')
    .then(res => res.json())
    .then(data => {
      let sortArr = data
      if (onOff) {
        sortArr = Array.from(data).sort((a, b) => {
          if (a.author < b.author) {
            return -1
          }
          if (a.author > b.author) {
            return 1
          }
          return 0
        })
      } else {
        sortArr = Array.from(data).sort((a, b) => {
          if (parseInt(a.id) < parseInt(b.id)) {
            return -1
          }
          if (parseInt(a.id) > parseInt(b.id)) {
            return 1
          }
          return 0
        })
      }
      sortArr.forEach((quote) => {
        fetchLike(quote.id).then(likes => listQuotes(quote, likes))
      })
    })
}

function listQuotes(quoteObj, likes = 0) {
  const list = document.querySelector('#quote-list')
  const quote = document.createElement('li')
  quote.className = 'quote-card'
  quote.id = quoteObj.id
  quote.innerHTML = `
                    <blockquote class ='blockquote'>
                        <p class='mb-0'>${quoteObj.quote}</p>
                        <footer class='blockquote-footer'>${quoteObj.author}</footer>
                        <br>
                        <button class='btn-success'>Likes: <span>${likes}</span></button>
                        <button class='btn-danger'>Delete</button>
                        <button class='edit'>Edit</button>
                    </blockquote>
                        `
  list.appendChild(quote)
}

function postNewQuote(quoteObj) {
  fetch('http://localhost:3000/quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accepter: 'application/json'
      },
      body: JSON.stringify(quoteObj)
    })
    .then(res => res.json())
    .then(data => listQuotes(data))
}

function deleteQuote(quoteId) {
  fetch(`http://localhost:3000/quotes/${quoteId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

function postLike(likeObj) {
  fetch('http://localhost:3000/likes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accepter: 'application/json'
    },
    body: JSON.stringify(likeObj)
  })
}

function fetchLike(quoteId) {
  return fetch(`http://localhost:3000/likes?quoteId=${quoteId}`)
    .then(res => res.json())
    .then(data => data.length)
}

function editQuote(e, quoteId) {
  const p = e.target.parentNode.querySelector('p')
  const footer = e.target.parentNode.querySelector('footer')
  if (e.target.innerText === 'Edit') {
    p.contentEditable = 'true'
    p.focus()
    footer.contentEditable = 'true'
    e.target.innerText = 'Done'
  } else {
    const updatedObj = {
      'id': quoteId,
      'quote': p.innerText,
      'author': footer.innerText
    }
    updateQuote(updatedObj)
    p.contentEditable = 'false'
    footer.contentEditable = 'false'
    e.target.innerText = 'Edit'
  }
}

function updateQuote(quoteObj) {
  fetch(`http://localhost:3000/quotes/${quoteObj.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accepter: 'application/json'
    },
    body: JSON.stringify(quoteObj)
  })
}