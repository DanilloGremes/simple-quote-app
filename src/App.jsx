import { useState, useEffect } from 'react'
import { jsPDF } from "jspdf"
import { auth, db, loginGoogle, logout } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore'

// IMPORTAÇÃO DOS COMPONENTES
import { translations } from './translations'
import Login from './components/Login'
import NavBar from './components/NavBar'
import QuoteForm from './components/QuoteForm'
import CompanySettings from './components/CompanySettings'
import HistoryList from './components/HistoryList'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('quote') 
  const [savedQuotes, setSavedQuotes] = useState([])
  const [editingId, setEditingId] = useState(null)
  
  const [lang, setLang] = useState(() => {
    const browserLang = navigator.language || navigator.userLanguage; 
    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('es')) return 'es';
    return 'en'; 
  })

  const t = (key) => translations[lang][key] || key

  const initialFormState = {
    quoteNumber: '', clientName: '', clientPhone: '', clientEmail: '', clientAddress: '',
    materialType: '', sqft: '', pricePerSqft: '', notes: ''
  }

  const [formData, setFormData] = useState(initialFormState)

  const [companyData, setCompanyData] = useState({
    companyName: '', companyPhone: '', companyEmail: '', 
    companyAddress: '', companyWebsite: '', companyTerms: '', logo: ''
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
            const docRef = doc(db, "users", currentUser.uid)
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && data.company) {
                setCompanyData(prev => ({ ...prev, ...data.company }))
              }
            }
            fetchQuotes(currentUser.uid)
        } catch (error) { console.error(error) }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const fetchQuotes = async (uid) => {
    try {
        const q = query(collection(db, "users", uid, "quotes"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const quotesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedQuotes(quotesList);
    } catch (e) { console.error(e) }
  }

  const deleteQuote = async (quoteId, e) => {
    e.stopPropagation(); 
    if (window.confirm(t('confirmDelete'))) {
        try {
            await deleteDoc(doc(db, "users", user.uid, "quotes", quoteId));
            alert(t('alertDeleted'));
            if (editingId === quoteId) clearForm();
            fetchQuotes(user.uid); 
        } catch (error) { alert("Error deleting document"); }
    }
  }

  const startEditing = (quote, e) => {
    e.stopPropagation(); 
    setEditingId(quote.id);
    setFormData({ ...quote }); 
    setActiveTab('quote');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const loadQuoteView = (quote) => {
    setFormData({ ...quote })
    setEditingId(null); 
    setActiveTab('quote')
  }

  const clearForm = () => {
      setFormData(initialFormState);
      setEditingId(null);
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 800000) { alert("Max 800KB"); return; }
      const reader = new FileReader()
      reader.onloadend = () => setCompanyData(prev => ({ ...prev, logo: reader.result }))
      reader.readAsDataURL(file)
    }
  }

  const saveCompanyData = async () => {
    if (!user) return;
    const sanitizedCompanyData = {
        companyName: companyData.companyName || "",
        companyPhone: companyData.companyPhone || "",
        companyEmail: companyData.companyEmail || "",
        companyAddress: companyData.companyAddress || "",
        companyWebsite: companyData.companyWebsite || "",
        companyTerms: companyData.companyTerms || "",
        logo: companyData.logo || ""
    };
    try {
      await setDoc(doc(db, "users", user.uid), { 
          email: user.email || "", company: sanitizedCompanyData 
      }, { merge: true })
      alert(t('alertSaved'))
    } catch (e) { alert("Error: " + e.message) }
  }

  const saveQuote = async () => {
    if (!user) return;
    const sanitizedQuote = {
        ...formData,
        total: (Number(formData.sqft) || 0) * (Number(formData.pricePerSqft) || 0),
        date: new Date().toISOString()
    };
    try {
      if (editingId) {
          await updateDoc(doc(db, "users", user.uid, "quotes", editingId), sanitizedQuote);
          alert(t('alertQuoteUpdated'));
      } else {
          await addDoc(collection(db, "users", user.uid, "quotes"), sanitizedQuote);
          alert(t('alertQuoteSaved'));
      }
      fetchQuotes(user.uid);
      clearForm();
    } catch (e) { alert("Error: " + e.message) }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCompanyChange = (e) => {
    const { name, value } = e.target
    setCompanyData(prev => ({ ...prev, [name]: value }))
  }

  const total = (Number(formData.sqft) || 0) * (Number(formData.pricePerSqft) || 0)

  // GERAÇÃO DE PDF COM JSPDF
  const generatePDF = () => {
    const doc = new jsPDF()
    const dataAtual = new Date().toLocaleDateString()
    if (companyData.logo) { try { doc.addImage(companyData.logo, 'JPEG', 20, 15, 30, 30) } catch (err) {} }
    const headerX = companyData.logo ? 60 : 20
    doc.setFont("helvetica", "bold"); doc.setFontSize(18)
    doc.text(companyData.companyName?.toUpperCase() || t('pdfQuote'), headerX, 25)
    doc.setFontSize(9); doc.setFont("helvetica", "normal")
    doc.text(companyData.companyAddress || "", headerX, 32)
    doc.text(`${companyData.companyPhone || ""}  ${companyData.companyEmail || ""}`, headerX, 37)
    doc.text(companyData.companyWebsite || "", headerX, 42)
    doc.setFontSize(10)
    doc.text(`${t('pdfDate')}: ${dataAtual}`, 150, 25)
    doc.text(t('pdfValid'), 150, 30)
    if (formData.quoteNumber) { doc.setFont("helvetica", "bold"); doc.text(`#: ${formData.quoteNumber}`, 150, 38) }
    doc.setLineWidth(0.5); doc.line(20, 50, 190, 50)
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.text(t('pdfClient'), 20, 60)
    doc.setFont("helvetica", "normal"); doc.setFontSize(10)
    doc.text(`${formData.clientName}`, 20, 68); doc.text(`${formData.clientAddress}`, 20, 74)
    doc.text(`${formData.clientPhone}`, 110, 68); doc.text(`${formData.clientEmail}`, 110, 74)
    doc.setFillColor(245, 245, 245); doc.rect(20, 85, 170, 40, "F")
    doc.setFont("helvetica", "bold"); doc.text(t('pdfDesc'), 25, 95); doc.text(t('pdfTotal'), 160, 95)
    doc.setFont("helvetica", "normal"); doc.text(formData.materialType || "-", 25, 105)
    doc.text(`${formData.sqft} sqft  x  $${formData.pricePerSqft}`, 25, 115)
    doc.setFont("helvetica", "bold"); doc.text(`$${total.toFixed(2)}`, 160, 105)
    doc.text(t('pdfTerms') + ":", 20, 140); doc.setFont("helvetica", "normal")
    const terms = companyData.companyTerms ? companyData.companyTerms + "\n" + formData.notes : formData.notes
    const splitNotes = doc.splitTextToSize(terms || "", 170); doc.text(splitNotes, 20, 148)
    doc.setFontSize(14); doc.setFont("helvetica", "bold")
    doc.text(`${t('pdfFinalTotal')}: $${total.toFixed(2)}`, 130, 240)
    doc.save(`Quote_${formData.clientName || "Draft"}.pdf`)
  }

  if (loading) return <div className="flex h-screen items-center justify-center">{t('loading')}</div>
  if (!user) return <Login loginGoogle={loginGoogle} t={t} setLang={setLang} lang={lang} />

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-2 font-sans text-gray-800">
      
      <NavBar user={user} t={t} logout={logout} setLang={setLang} lang={lang} />

      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        
        {/* MENU TABS */}
        <div className="flex border-b border-gray-200 text-xs md:text-sm">
          <button onClick={() => setActiveTab('quote')} className={`flex-1 py-3 font-bold ${activeTab === 'quote' ? 'bg-black text-white' : 'text-gray-500'}`}>{t('tabNew')}</button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 font-bold ${activeTab === 'history' ? 'bg-black text-white' : 'text-gray-500'}`}>{t('tabHistory')}</button>
          <button onClick={() => setActiveTab('company')} className={`flex-1 py-3 font-bold ${activeTab === 'company' ? 'bg-black text-white' : 'text-gray-500'}`}>{t('tabCompany')}</button>
        </div>

        {/* COMPONENTES RENDERIZADOS CONDICIONALMENTE */}
        {activeTab === 'company' && (
          <CompanySettings 
            companyData={companyData} 
            handleCompanyChange={handleCompanyChange} 
            handleLogoChange={handleLogoChange}
            saveCompanyData={saveCompanyData}
            t={t}
          />
        )}

        {activeTab === 'history' && (
           <HistoryList 
            savedQuotes={savedQuotes}
            loadQuoteView={loadQuoteView}
            startEditing={startEditing}
            deleteQuote={deleteQuote}
            t={t}
           />
        )}

        {activeTab === 'quote' && (
            <QuoteForm 
                formData={formData}
                handleChange={handleChange}
                saveQuote={saveQuote}
                generatePDF={generatePDF}
                t={t}
                total={total}
                editingId={editingId}
                clearForm={clearForm}
            />
        )}
      </div>
    </div>
  )
}

export default App