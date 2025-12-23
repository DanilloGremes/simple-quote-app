import { useState, useEffect } from 'react'
import { jsPDF } from "jspdf"
import { auth, db, loginGoogle, logout } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore'

// --- DICIONÁRIO DE TRADUÇÕES ---
const translations = {
  pt: {
    appTitle: "SquarePro Quote", // Sugestão de nome mais amplo
    loginBtn: "Entrar com Google",
    loading: "Carregando...",
    welcome: "Olá",
    logout: "Sair",
    tabNew: "NOVO",
    tabHistory: "HISTÓRICO",
    tabCompany: "EMPRESA",
    
    companyTitle: "Dados da Sua Empresa",
    logoLabel: "Logotipo (Imagem)",
    companyNamePH: "Nome da Empresa",
    addressPH: "Endereço Comercial",
    websitePH: "Site (ex: www.minhaempresa.com)",
    phonePH: "Telefone",
    emailPH: "Email",
    termsPH: "Termos Padrão (Ex: 50% entrada...)",
    saveBtn: "Salvar Configurações",
    alertSaved: "Dados salvos!",

    historyTitle: "Orçamentos Salvos",
    emptyHistory: "Nenhum orçamento salvo ainda.",
    openBtn: "Abrir",
    confirmDelete: "Tem certeza que deseja apagar este orçamento?",
    alertDeleted: "Orçamento apagado com sucesso!",
    
    clientTitle: "Cliente",
    quoteNumberPH: "Orç. #",
    clientNamePH: "Nome Completo",
    clientAddressPH: "Endereço da Obra",
    serviceTitle: "Serviço / Materiais",
    materialLabel: "DESCRIÇÃO / MATERIAL",
    materialPH: "Ex: Instalação de Piso / Pintura / Drywall / Limpeza de Casa",
    sqftLabel: "ÁREA (SQFT)",
    priceLabel: "PREÇO ($)",
    notesPH: "Observações e detalhes...",
    totalEst: "TOTAL ESTIMADO",
    btnSave: "Salvar",
    btnPDF: "Baixar PDF",
    alertQuoteSaved: "Orçamento salvo!",

    pdfQuote: "ORÇAMENTO",
    pdfDate: "Data",
    pdfValid: "Validade: 30 dias",
    pdfClient: "CLIENTE",
    pdfDesc: "DESCRIÇÃO",
    pdfTotal: "TOTAL",
    pdfTerms: "Notas / Termos",
    pdfFinalTotal: "TOTAL FINAL"
  },
  en: {
    appTitle: "SquarePro Quote",
    loginBtn: "Sign in with Google",
    loading: "Loading...",
    welcome: "Hello",
    logout: "Logout",
    tabNew: "NEW QUOTE",
    tabHistory: "HISTORY",
    tabCompany: "MY BUSINESS",
    
    companyTitle: "Business Settings",
    logoLabel: "Logo (Image)",
    companyNamePH: "Business Name",
    addressPH: "Business Address",
    websitePH: "Website",
    phonePH: "Phone",
    emailPH: "Email",
    termsPH: "Default Terms (e.g. 50% deposit...)",
    saveBtn: "Save Settings",
    alertSaved: "Settings saved!",

    historyTitle: "Saved Quotes",
    emptyHistory: "No quotes found.",
    openBtn: "Open",
    confirmDelete: "Are you sure you want to delete this quote?",
    alertDeleted: "Quote deleted successfully!",
    
    clientTitle: "Client Info",
    quoteNumberPH: "Quote #",
    clientNamePH: "Full Name",
    clientAddressPH: "Job Address",
    serviceTitle: "Service / Materials",
    materialLabel: "DESCRIPTION / MATERIAL",
    materialPH: "Ex: LVP Floor / Painting / Drywall / House Cleaning",
    sqftLabel: "AREA (SQFT)",
    priceLabel: "PRICE ($)",
    notesPH: "Notes and details...",
    totalEst: "ESTIMATED TOTAL",
    btnSave: "Save",
    btnPDF: "Download PDF",
    alertQuoteSaved: "Quote saved!",

    pdfQuote: "QUOTE",
    pdfDate: "Date",
    pdfValid: "Valid for 30 days",
    pdfClient: "CLIENT",
    pdfDesc: "DESCRIPTION",
    pdfTotal: "TOTAL",
    pdfTerms: "Notes / Terms",
    pdfFinalTotal: "GRAND TOTAL"
  },
  es: {
    appTitle: "SquarePro Quote",
    loginBtn: "Entrar con Google",
    loading: "Cargando...",
    welcome: "Hola",
    logout: "Salir",
    tabNew: "NUEVO",
    tabHistory: "HISTORIAL",
    tabCompany: "EMPRESA",
    
    companyTitle: "Datos de Empresa",
    logoLabel: "Logotipo (Imagen)",
    companyNamePH: "Nombre de Empresa",
    addressPH: "Dirección Comercial",
    websitePH: "Sitio Web",
    phonePH: "Teléfono",
    emailPH: "Correo",
    termsPH: "Términos (Ej: 50% anticipo...)",
    saveBtn: "Guardar Configuración",
    alertSaved: "¡Datos guardados!",

    historyTitle: "Presupuestos Guardados",
    emptyHistory: "No hay presupuestos aún.",
    openBtn: "Abrir",
    confirmDelete: "¿Estás seguro de que quieres borrar este presupuesto?",
    alertDeleted: "¡Presupuesto borrado!",
    
    clientTitle: "Cliente",
    quoteNumberPH: "Presup. #",
    clientNamePH: "Nombre Completo",
    clientAddressPH: "Dirección de Obra",
    serviceTitle: "Servicio / Materiales",
    materialLabel: "DESCRIPCIÓN / MATERIAL",
    materialPH: "Ej: Instalación de Piso / Pintura / Limpieza de Casa",
    sqftLabel: "ÁREA (SQFT)",
    priceLabel: "PRECIO ($)",
    notesPH: "Notas y detalles...",
    totalEst: "TOTAL ESTIMADO",
    btnSave: "Guardar",
    btnPDF: "Bajar PDF",
    alertQuoteSaved: "¡Guardado!",

    pdfQuote: "PRESUPUESTO",
    pdfDate: "Fecha",
    pdfValid: "Validez: 30 días",
    pdfClient: "CLIENTE",
    pdfDesc: "DESCRIPCIÓN",
    pdfTotal: "TOTAL",
    pdfTerms: "Notas / Términos",
    pdfFinalTotal: "TOTAL FINAL"
  }
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('quote') 
  const [savedQuotes, setSavedQuotes] = useState([])
  
  const [lang, setLang] = useState(() => {
    const browserLang = navigator.language || navigator.userLanguage; 
    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('es')) return 'es';
    return 'en'; 
  })

  const t = (key) => translations[lang][key] || key

  const [formData, setFormData] = useState({
    quoteNumber: '', clientName: '', clientPhone: '', clientEmail: '', clientAddress: '',
    materialType: '', sqft: '', pricePerSqft: '', notes: ''
  })

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
        } catch (error) {
            console.error("Erro ao carregar dados:", error)
        }
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
    } catch (e) {
        console.error("Erro ao buscar histórico:", e)
    }
  }

  // --- NOVA FUNÇÃO DE DELETAR ---
  const deleteQuote = async (quoteId, e) => {
    e.stopPropagation(); // Evita que abra o orçamento ao clicar na lixeira
    
    if (window.confirm(t('confirmDelete'))) {
        try {
            await deleteDoc(doc(db, "users", user.uid, "quotes", quoteId));
            alert(t('alertDeleted'));
            fetchQuotes(user.uid); // Atualiza a lista
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert("Erro ao deletar.");
        }
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 800000) {
          alert("Imagem muito grande! Tente uma imagem menor que 800KB.");
          return;
      }
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
          email: user.email || "", 
          company: sanitizedCompanyData 
      }, { merge: true })
      
      alert(t('alertSaved'))
    } catch (e) { 
        console.error(e);
        alert("Error: " + e.message) 
    }
  }

  const saveQuoteToHistory = async () => {
    if (!user) return;
    
    const sanitizedQuote = {
        quoteNumber: formData.quoteNumber || "",
        clientName: formData.clientName || "",
        clientPhone: formData.clientPhone || "",
        clientEmail: formData.clientEmail || "",
        clientAddress: formData.clientAddress || "",
        materialType: formData.materialType || "",
        sqft: formData.sqft || "",
        pricePerSqft: formData.pricePerSqft || "",
        notes: formData.notes || "",
        total: (Number(formData.sqft) || 0) * (Number(formData.pricePerSqft) || 0),
        date: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "users", user.uid, "quotes"), sanitizedQuote)
      fetchQuotes(user.uid)
      alert(t('alertQuoteSaved'))
    } catch (e) { alert("Error: " + e.message) }
  }

  const loadQuote = (quote) => {
    setFormData({
        quoteNumber: quote.quoteNumber || '',
        clientName: quote.clientName || '',
        clientPhone: quote.clientPhone || '',
        clientEmail: quote.clientEmail || '',
        clientAddress: quote.clientAddress || '',
        materialType: quote.materialType || '',
        sqft: quote.sqft || '',
        pricePerSqft: quote.pricePerSqft || '',
        notes: quote.notes || ''
    })
    setActiveTab('quote')
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

  const generatePDF = () => {
    const doc = new jsPDF()
    const dataAtual = new Date().toLocaleDateString()

    if (companyData.logo) {
        try { doc.addImage(companyData.logo, 'JPEG', 20, 15, 30, 30) } catch (err) {}
    }

    const headerX = companyData.logo ? 60 : 20
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text(companyData.companyName?.toUpperCase() || t('pdfQuote'), headerX, 25)
    
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(companyData.companyAddress || "", headerX, 32)
    doc.text(`${companyData.companyPhone || ""}  ${companyData.companyEmail || ""}`, headerX, 37)
    doc.text(companyData.companyWebsite || "", headerX, 42)

    doc.setFontSize(10)
    doc.text(`${t('pdfDate')}: ${dataAtual}`, 150, 25)
    doc.text(t('pdfValid'), 150, 30)
    if (formData.quoteNumber) {
        doc.setFont("helvetica", "bold")
        doc.text(`#: ${formData.quoteNumber}`, 150, 38)
    }

    doc.setLineWidth(0.5)
    doc.line(20, 50, 190, 50)

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(t('pdfClient'), 20, 60)
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`${formData.clientName}`, 20, 68)
    doc.text(`${formData.clientAddress}`, 20, 74)
    doc.text(`${formData.clientPhone}`, 110, 68)
    doc.text(`${formData.clientEmail}`, 110, 74)

    doc.setFillColor(245, 245, 245)
    doc.rect(20, 85, 170, 40, "F")

    doc.setFont("helvetica", "bold")
    doc.text(t('pdfDesc'), 25, 95)
    doc.text(t('pdfTotal'), 160, 95)
    
    doc.setFont("helvetica", "normal")
    doc.text(formData.materialType || "-", 25, 105)
    doc.text(`${formData.sqft} sqft  x  $${formData.pricePerSqft}`, 25, 115)
    
    doc.setFont("helvetica", "bold")
    doc.text(`$${total.toFixed(2)}`, 160, 105)

    doc.text(t('pdfTerms') + ":", 20, 140)
    doc.setFont("helvetica", "normal")
    const terms = companyData.companyTerms 
      ? companyData.companyTerms + "\n" + formData.notes 
      : formData.notes
    const splitNotes = doc.splitTextToSize(terms || "", 170)
    doc.text(splitNotes, 20, 148)

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(`${t('pdfFinalTotal')}: $${total.toFixed(2)}`, 130, 240)

    doc.save(`Quote_${formData.clientName || "Draft"}.pdf`)
  }

  if (loading) return <div className="flex h-screen items-center justify-center">{t('loading')}</div>

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-10 rounded-xl shadow-xl text-center max-w-md w-full">
          <h1 className="text-3xl font-bold mb-2">{t('appTitle')}</h1>
          <div className="flex justify-center gap-4 mb-6">
            <button onClick={() => setLang('en')} className={`text-xs font-bold ${lang==='en'?'underline':''}`}>EN</button>
            <button onClick={() => setLang('pt')} className={`text-xs font-bold ${lang==='pt'?'underline':''}`}>PT</button>
            <button onClick={() => setLang('es')} className={`text-xs font-bold ${lang==='es'?'underline':''}`}>ES</button>
          </div>
          <button onClick={loginGoogle} className="w-full bg-black text-white py-3 rounded mt-4">{t('loginBtn')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-2 font-sans text-gray-800">
      
      <div className="w-full max-w-2xl flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{t('welcome')}, {user.displayName ? user.displayName.split(' ')[0] : ""}</span>
            <div className="flex gap-2 bg-gray-200 px-2 py-1 rounded text-[10px] font-bold">
                <button onClick={() => setLang('en')} className={lang==='en'?'text-black':'text-gray-400'}>EN</button>
                <button onClick={() => setLang('pt')} className={lang==='pt'?'text-black':'text-gray-400'}>PT</button>
                <button onClick={() => setLang('es')} className={lang==='es'?'text-black':'text-gray-400'}>ES</button>
            </div>
        </div>
        <button onClick={logout} className="text-xs text-red-500">{t('logout')}</button>
      </div>

      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        
        <div className="flex border-b border-gray-200 text-xs md:text-sm">
          <button onClick={() => setActiveTab('quote')} className={`flex-1 py-3 font-bold ${activeTab === 'quote' ? 'bg-black text-white' : 'text-gray-500'}`}>{t('tabNew')}</button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 font-bold ${activeTab === 'history' ? 'bg-black text-white' : 'text-gray-500'}`}>{t('tabHistory')}</button>
          <button onClick={() => setActiveTab('company')} className={`flex-1 py-3 font-bold ${activeTab === 'company' ? 'bg-black text-white' : 'text-gray-500'}`}>{t('tabCompany')}</button>
        </div>

        {activeTab === 'company' && (
          <div className="p-6 space-y-4">
            <h2 className="font-bold border-b pb-2">{t('companyTitle')}</h2>
            
            <div>
                <label className="block text-xs font-bold mb-1">{t('logoLabel')}</label>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm w-full" />
                {companyData.logo && <img src={companyData.logo} alt="Logo Preview" className="h-16 mt-2 border" />}
            </div>
            <input type="text" name="companyName" value={companyData.companyName} onChange={handleCompanyChange} className="w-full p-2 border rounded" placeholder={t('companyNamePH')} />
            <input type="text" name="companyAddress" value={companyData.companyAddress} onChange={handleCompanyChange} className="w-full p-2 border rounded" placeholder={t('addressPH')} />
            <input type="text" name="companyWebsite" value={companyData.companyWebsite} onChange={handleCompanyChange} className="w-full p-2 border rounded" placeholder={t('websitePH')} />
            <div className="grid grid-cols-2 gap-2">
                <input type="text" name="companyPhone" value={companyData.companyPhone} onChange={handleCompanyChange} className="w-full p-2 border rounded" placeholder={t('phonePH')} />
                <input type="text" name="companyEmail" value={companyData.companyEmail} onChange={handleCompanyChange} className="w-full p-2 border rounded" placeholder={t('emailPH')} />
            </div>
            <textarea name="companyTerms" value={companyData.companyTerms} onChange={handleCompanyChange} className="w-full p-2 border rounded" rows="3" placeholder={t('termsPH')}></textarea>
            <button onClick={saveCompanyData} className="w-full bg-green-600 text-white py-3 rounded font-bold">{t('saveBtn')}</button>
          </div>
        )}

        {/* --- ABA HISTÓRICO ATUALIZADA COM BOTÃO DE DELETAR --- */}
        {activeTab === 'history' && (
            <div className="p-4">
                <h2 className="font-bold mb-4">{t('historyTitle')}</h2>
                {savedQuotes.length === 0 ? <p className="text-gray-500 text-sm">{t('emptyHistory')}</p> : (
                    <div className="space-y-2">
                        {savedQuotes.map(quote => (
                            <div key={quote.id} onClick={() => loadQuote(quote)} className="border p-3 rounded hover:bg-gray-50 cursor-pointer flex justify-between items-center bg-gray-50">
                                <div>
                                    <p className="font-bold text-sm">{quote.clientName || "-"}</p>
                                    <p className="text-xs text-gray-500">#{quote.quoteNumber} • {quote.materialType}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="font-bold">${quote.total?.toFixed(2)}</p>
                                        <span className="text-xs text-blue-600">{t('openBtn')}</span>
                                    </div>
                                    
                                    {/* Botão de Deletar */}
                                    <button 
                                        onClick={(e) => deleteQuote(quote.id, e)}
                                        className="bg-red-100 p-2 rounded text-red-600 hover:bg-red-200 transition"
                                        title="Apagar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'quote' && (
          <div className="p-6 space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
                <h2 className="font-bold">{t('clientTitle')}</h2>
                <input type="text" name="quoteNumber" value={formData.quoteNumber} onChange={handleChange} 
                    className="p-1 border rounded w-24 text-right text-sm" placeholder={t('quoteNumberPH')} />
             </div>

             <div className="space-y-3">
                <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded" placeholder={t('clientNamePH')} />
                <input type="text" name="clientAddress" value={formData.clientAddress} onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded" placeholder={t('clientAddressPH')} />
                <div className="grid grid-cols-2 gap-3">
                    <input type="tel" name="clientPhone" value={formData.clientPhone} onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded" placeholder={t('phonePH')} />
                    <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded" placeholder={t('emailPH')} />
                </div>
             </div>
             
             <h2 className="font-bold border-b pb-2 pt-4">{t('serviceTitle')}</h2>
             
             <div>
                <label className="text-xs font-bold text-gray-500 ml-1">{t('materialLabel')}</label>
                <input type="text" name="materialType" value={formData.materialType} onChange={handleChange} 
                    className="w-full p-3 border rounded" placeholder={t('materialPH')} />
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="text-xs font-bold text-gray-500 ml-1">{t('sqftLabel')}</label>
                   <input type="number" name="sqft" value={formData.sqft} onChange={handleChange} className="w-full p-3 border rounded font-mono" placeholder="0" />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 ml-1">{t('priceLabel')}</label>
                   <input type="number" name="pricePerSqft" value={formData.pricePerSqft} onChange={handleChange} className="w-full p-3 border rounded font-mono" placeholder="0.00" />
                </div>
             </div>

            <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full p-3 border rounded text-sm" rows="2" placeholder={t('notesPH')}></textarea>

             <div className="bg-black text-white p-4 rounded mt-4">
                <div className="flex justify-between items-end mb-4">
                    <p className="text-sm text-gray-400">{t('totalEst')}</p>
                    <p className="text-3xl font-bold">${total.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={saveQuoteToHistory} className="bg-gray-700 hover:bg-gray-600 py-3 rounded font-bold text-sm">
                        💾 {t('btnSave')}
                    </button>
                    <button onClick={generatePDF} className="bg-white text-black hover:bg-gray-200 py-3 rounded font-bold text-sm">
                        📄 {t('btnPDF')}
                    </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App