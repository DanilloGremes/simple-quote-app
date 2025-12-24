import { useState, useEffect } from 'react'
import { jsPDF } from "jspdf"
import { auth, db, loginGoogle, logout } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore'

import { translations } from './translations'
import Login from './components/Login'
import NavBar from './components/NavBar'
import QuoteForm from './components/QuoteForm'
import CompanySettings from './components/CompanySettings'
import HistoryList from './components/HistoryList'
import Dashboard from './components/Dashboard'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard') 
  const [savedQuotes, setSavedQuotes] = useState([])
  const [editingId, setEditingId] = useState(null)
  
  const [lang, setLang] = useState(() => {
    const browserLang = navigator.language || navigator.userLanguage; 
    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('es')) return 'es';
    return 'en'; 
  })

  const t = (key) => translations[lang][key] || key

  // --- MUDANÇA 1: Estrutura inicial agora tem um array 'items'
  const initialFormState = {
    quoteNumber: '', clientName: '', clientPhone: '', clientEmail: '', clientAddress: '',
    notes: '',
    items: [{ description: '', qty: '', price: '' }] 
  }

  const [formData, setFormData] = useState(initialFormState)

  const [companyData, setCompanyData] = useState({
    companyName: '', companyPhone: '', companyEmail: '', 
    companyAddress: '', companyWebsite: '', companyTerms: '', logo: ''
  })

  // --- MUDANÇA 2: Cálculo do Total percorrendo o array
  const total = formData.items.reduce((acc, item) => {
      return acc + ((Number(item.qty) || 0) * (Number(item.price) || 0));
  }, 0);

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

  // Função updateStatus (mantida)
  const updateStatus = async (quoteId, newStatus, e) => {
      e.stopPropagation();
      try {
          const quoteRef = doc(db, "users", user.uid, "quotes", quoteId);
          await updateDoc(quoteRef, { status: newStatus });
          setSavedQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: newStatus } : q));
      } catch (error) { console.error(error) }
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
    
    // --- MUDANÇA 3: Compatibilidade com dados antigos (LEGACY DATA)
    // Se o orçamento antigo não tem 'items', criamos um item baseado nos campos antigos
    let loadedItems = quote.items || [];
    if (loadedItems.length === 0 && quote.materialType) {
        loadedItems = [{
            description: quote.materialType,
            qty: quote.sqft,
            price: quote.pricePerSqft
        }];
    }
    // Se mesmo assim estiver vazio, cria linha em branco
    if (loadedItems.length === 0) loadedItems = [{ description: '', qty: '', price: '' }];

    setFormData({ 
        ...quote, 
        items: loadedItems 
    });
    
    setActiveTab('quote');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const loadQuoteView = (quote) => {
    // Mesma lógica de compatibilidade aqui
    let loadedItems = quote.items || [];
    if (loadedItems.length === 0 && quote.materialType) {
        loadedItems = [{ description: quote.materialType, qty: quote.sqft, price: quote.pricePerSqft }];
    }
    if (loadedItems.length === 0) loadedItems = [{ description: '', qty: '', price: '' }];

    setFormData({ ...quote, items: loadedItems })
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
    
    // --- MUDANÇA 4: Salvamos o array de items e usamos campos antigos apenas como "resumo" do primeiro item (opcional)
    // Isso ajuda a manter a lista de histórico funcionando sem quebrar
    const mainItem = formData.items[0] || {};
    
    const sanitizedQuote = {
        quoteNumber: formData.quoteNumber || "",
        clientName: formData.clientName || "",
        clientPhone: formData.clientPhone || "",
        clientEmail: formData.clientEmail || "",
        clientAddress: formData.clientAddress || "",
        notes: formData.notes || "",
        items: formData.items, // Salvando o array
        
        // Campos legacy para a lista exibir algo
        materialType: mainItem.description || "Multi-services",
        
        total: total, // Usando o total calculado pelo array
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

  // (handleChange removido daqui pois agora está dentro do QuoteForm ou passado via prop se necessário, 
  // mas como o QuoteForm gerencia input simples, precisamos passar o setFormData)
  // --- ATENÇÃO: No QuoteForm, eu usei setFormData direto.

  const handleCompanyChange = (e) => {
    const { name, value } = e.target
    setCompanyData(prev => ({ ...prev, [name]: value }))
  }

  // --- MUDANÇA 5: PDF Complexo com Loop
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
    doc.setFillColor(245, 245, 245); doc.rect(20, 85, 170, 10, "F") // Cabeçalho menor
    
    // --- CABEÇALHO DA TABELA NO PDF
    doc.setFont("helvetica", "bold"); doc.setFontSize(9)
    doc.text(t('itemDesc'), 25, 92)
    doc.text(t('itemQty'), 110, 92)
    doc.text(t('itemPrice'), 140, 92)
    doc.text(t('itemTotal'), 170, 92)

    // --- LOOP DOS ITENS
    let yPos = 105;
    doc.setFont("helvetica", "normal");
    
    formData.items.forEach(item => {
        const itemTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
        doc.text(item.description || "-", 25, yPos)
        doc.text(String(item.qty || 0), 110, yPos)
        doc.text(`$${Number(item.price).toFixed(2)}`, 140, yPos)
        doc.text(`$${itemTotal.toFixed(2)}`, 170, yPos)
        yPos += 8; // Pula linha
    });

    // Linha final
    doc.line(100, yPos, 190, yPos)
    yPos += 8;
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(12)
    doc.text(`${t('pdfFinalTotal')}: $${total.toFixed(2)}`, 120, yPos)

    yPos += 15;
    doc.setFontSize(10); doc.text(t('pdfTerms') + ":", 20, yPos)
    doc.setFont("helvetica", "normal")
    const terms = companyData.companyTerms ? companyData.companyTerms + "\n" + formData.notes : formData.notes
    const splitNotes = doc.splitTextToSize(terms || "", 170); 
    doc.text(splitNotes, 20, yPos + 6)
    
    doc.save(`Quote_${formData.clientName || "Draft"}.pdf`)
  }

  if (loading) return <div className="flex h-screen items-center justify-center">{t('loading')}</div>
  if (!user) return <Login loginGoogle={loginGoogle} t={t} setLang={setLang} lang={lang} />

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-2 font-sans text-gray-800">
      
      <NavBar user={user} t={t} logout={logout} setLang={setLang} lang={lang} />

      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        
        <div className="flex border-b border-gray-200 text-xs md:text-sm">
          <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-3 font-bold ${activeTab === 'dashboard' ? 'bg-black text-white' : 'text-gray-500'}`}>{t('tabHome')}</button>
          <button onClick={() => setActiveTab('quote')} className={`flex-1 py-3 font-bold ${activeTab === 'quote' ? 'bg-black text-white' : 'text-gray-500'}`}>{t('tabNew')}</button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 font-bold ${activeTab === 'history' ? 'bg-black text-white' : 'text-gray-500'}`}>{t('tabHistory')}</button>
          <button onClick={() => setActiveTab('company')} className={`flex-1 py-3 font-bold ${activeTab === 'company' ? 'bg-black text-white' : 'text-gray-500'}`}>{t('tabCompany')}</button>
        </div>

        {activeTab === 'dashboard' && <Dashboard savedQuotes={savedQuotes} t={t} setActiveTab={setActiveTab} />}

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
            updateStatus={updateStatus}
            t={t}
           />
        )}

        {activeTab === 'quote' && (
            <QuoteForm 
                formData={formData}
                setFormData={setFormData} // Passando setter
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