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
import ClientsTab from './components/ClientsTab'
import ServicesTab from './components/ServicesTab'
import BottomNav from './components/BottomNav'
import MenuTab from './components/MenuTab'     

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard') 
  const [savedQuotes, setSavedQuotes] = useState([])
  const [clients, setClients] = useState([])
  const [services, setServices] = useState([])

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
    notes: '',
    items: [{ description: '', qty: '', price: '' }] 
  }

  const [formData, setFormData] = useState(initialFormState)

  const [companyData, setCompanyData] = useState({
    companyName: '', companyPhone: '', companyEmail: '', 
    companyAddress: '', companyWebsite: '', companyTerms: '', logo: ''
  })

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
            fetchClients(currentUser.uid)
            fetchServices(currentUser.uid)
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

  const fetchClients = async (uid) => {
    try {
        const q = query(collection(db, "users", uid, "clients"), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        const clientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClients(clientsList);
    } catch (e) { console.error(e) }
  }

  const fetchServices = async (uid) => {
    try {
        const q = query(collection(db, "users", uid, "services"), orderBy("description", "asc"));
        const querySnapshot = await getDocs(q);
        const servicesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(servicesList);
    } catch (e) { console.error(e) }
  }

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
    let loadedItems = quote.items || [];
    if (loadedItems.length === 0 && quote.materialType) {
        loadedItems = [{
            description: quote.materialType,
            qty: quote.sqft,
            price: quote.pricePerSqft
        }];
    }
    if (loadedItems.length === 0) loadedItems = [{ description: '', qty: '', price: '' }];

    setFormData({ ...quote, items: loadedItems });
    setActiveTab('quote');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const loadQuoteView = (quote) => {
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
    const mainItem = formData.items[0] || {};
    const sanitizedQuote = {
        quoteNumber: formData.quoteNumber || "",
        clientName: formData.clientName || "",
        clientPhone: formData.clientPhone || "",
        clientEmail: formData.clientEmail || "",
        clientAddress: formData.clientAddress || "",
        notes: formData.notes || "",
        items: formData.items,
        materialType: mainItem.description || "Multi-services",
        total: total,
        date: new Date().toISOString()
    };
    try {
      if (editingId) {
          await updateDoc(doc(db, "users", user.uid, "quotes", editingId), sanitizedQuote);
          alert(t('alertQuoteUpdated'));
      } else {
          await addDoc(collection(db, "users", user.uid, "quotes"), sanitizedQuote);
          alert(t('alertQuoteSaved'));

          if (formData.clientName) {
              const clientExists = clients.some(c => c.name.toLowerCase() === formData.clientName.toLowerCase());
              if (!clientExists) {
                  await addDoc(collection(db, "users", user.uid, "clients"), {
                      name: formData.clientName,
                      phone: formData.clientPhone,
                      email: formData.clientEmail,
                      address: formData.clientAddress
                  });
                  fetchClients(user.uid); 
              }
          }
      }
      fetchQuotes(user.uid);
      clearForm();
    } catch (e) { alert("Error: " + e.message) }
  }

  const handleCompanyChange = (e) => {
    const { name, value } = e.target
    setCompanyData(prev => ({ ...prev, [name]: value }))
  }

// Função atualizada para aceitar o tipo de documento (quote ou invoice)
  const generatePDF = (mode = 'quote', quoteData = null) => {
    // Se passarmos dados diretos (do historico), usa eles. Se não, usa o form atual.
    const data = quoteData || formData;
    const isInvoice = mode === 'invoice';
    const isPaid = data.status === 'paid' || data.status === 'approved'; // Consideramos approved como pronto para pagar

    const doc = new jsPDF()
    const dataAtual = new Date().toLocaleDateString()
    
    // Configurações de Cor
    const primaryColor = isInvoice ? [0, 0, 0] : [0, 0, 0]; // Preto para ambos (minimalista)
    const headerColor = isInvoice ? [240, 240, 240] : [245, 245, 245]; // Cinza leve

    if (companyData.logo) { try { doc.addImage(companyData.logo, 'JPEG', 20, 15, 30, 30) } catch (err) {} }
    const headerX = companyData.logo ? 60 : 20
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(18)
    // Título muda dependendo do modo
    const title = isInvoice ? (isPaid ? t('pdfReceipt') : t('pdfInvoice')) : (companyData.companyName?.toUpperCase() || t('pdfQuote'));
    doc.text(title, headerX, 25)
    
    doc.setFontSize(9); doc.setFont("helvetica", "normal")
    doc.text(companyData.companyAddress || "", headerX, 32)
    doc.text(`${companyData.companyPhone || ""}  ${companyData.companyEmail || ""}`, headerX, 37)
    doc.text(companyData.companyWebsite || "", headerX, 42)
    
    // Info Lateral
    doc.setFontSize(10)
    doc.text(`${t('pdfDate')}: ${dataAtual}`, 150, 25)
    
    // Se for Invoice, mostra status de pagamento
    if (isInvoice) {
        doc.setFont("helvetica", "bold");
        if (isPaid) {
            doc.setTextColor(0, 150, 0); // Verde
            doc.text(t('pdfPaid'), 150, 35);
        } else {
            doc.setTextColor(200, 0, 0); // Vermelho
            doc.text(t('pdfUnpaid'), 150, 35);
        }
        doc.setTextColor(0, 0, 0); // Volta pro preto
    } else {
        doc.text(t('pdfValid'), 150, 30)
    }

    if (data.quoteNumber) { doc.setFont("helvetica", "bold"); doc.text(`#: ${data.quoteNumber}`, 150, 42) }
    
    doc.setLineWidth(0.5); doc.line(20, 50, 190, 50)
    
    // Cliente
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); 
    doc.text(isInvoice ? t('pdfBillTo') : t('pdfClient'), 20, 60)
    
    doc.setFont("helvetica", "normal"); doc.setFontSize(10)
    doc.text(`${data.clientName}`, 20, 68); doc.text(`${data.clientAddress}`, 20, 74)
    doc.text(`${data.clientPhone}`, 110, 68); doc.text(`${data.clientEmail}`, 110, 74)
    
    // Cabeçalho Tabela
    doc.setFillColor(...headerColor); doc.rect(20, 85, 170, 10, "F") 
    doc.setFont("helvetica", "bold"); doc.setFontSize(9)
    doc.text(t('itemDesc'), 25, 92)
    doc.text(t('itemQty'), 110, 92)
    doc.text(t('itemPrice'), 140, 92)
    doc.text(t('itemTotal'), 170, 92)

    let yPos = 105;
    doc.setFont("helvetica", "normal");
    
    // Tratamento de Itens (Array ou Legacy)
    let itemsToPrint = data.items || [];
    if (itemsToPrint.length === 0 && data.materialType) {
         itemsToPrint = [{ description: data.materialType, qty: data.sqft, price: data.pricePerSqft }];
    }

    itemsToPrint.forEach(item => {
        const itemTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
        doc.text(item.description || "-", 25, yPos)
        doc.text(String(item.qty || 0), 110, yPos)
        doc.text(`$${Number(item.price).toFixed(2)}`, 140, yPos)
        doc.text(`$${itemTotal.toFixed(2)}`, 170, yPos)
        yPos += 8; 
    });

    doc.line(100, yPos, 190, yPos)
    yPos += 8;
    
    doc.setFont("helvetica", "bold"); doc.setFontSize(12)
    const finalTotal = data.total || itemsToPrint.reduce((acc, i) => acc + ((Number(i.qty)||0)*(Number(i.price)||0)), 0);
    
    doc.text(`${t('pdfFinalTotal')}: $${Number(finalTotal).toFixed(2)}`, 120, yPos)

    yPos += 15;
    doc.setFontSize(10); doc.text(t('pdfTerms') + ":", 20, yPos)
    doc.setFont("helvetica", "normal")
    const terms = companyData.companyTerms ? companyData.companyTerms + "\n" + data.notes : data.notes
    const splitNotes = doc.splitTextToSize(terms || "", 170); 
    doc.text(splitNotes, 20, yPos + 6)
    
    const fileName = isInvoice ? `Invoice_${data.clientName}.pdf` : `Quote_${data.clientName}.pdf`;
    doc.save(fileName)
  }

  if (loading) return <div className="flex h-screen items-center justify-center">{t('loading')}</div>
  if (!user) return <Login loginGoogle={loginGoogle} t={t} setLang={setLang} lang={lang} />

  return (
    // Adicionei pb-24 aqui para o conteúdo não ficar atrás da barra de navegação
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-2 font-sans text-gray-800 pb-24">
      
      {/* NavBar agora serve como Header simples */}
      <NavBar user={user} t={t} logout={logout} setLang={setLang} lang={lang} />

      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        
        {/* REMOVIDO: O antigo menu de abas do topo */}
        
        {activeTab === 'dashboard' && <Dashboard savedQuotes={savedQuotes} t={t} setActiveTab={setActiveTab} />}

        {activeTab === 'clients' && (
           <ClientsTab 
             user={user} 
             clients={clients} 
             fetchClients={fetchClients} 
             t={t} 
           />
        )}

        {activeTab === 'services' && (
           <ServicesTab 
             user={user} 
             services={services} 
             fetchServices={fetchServices} 
             t={t} 
           />
        )}
        
        {/* --- NOVO: ABA MENU --- */}
        {activeTab === 'menu' && (
           <MenuTab 
             setActiveTab={setActiveTab}
             t={t}
             logout={logout}
           />
        )}

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
            generatePDF={generatePDF}
            t={t}
           />
        )}

        {activeTab === 'quote' && (
            <QuoteForm 
                formData={formData}
                setFormData={setFormData}
                saveQuote={saveQuote}
                generatePDF={generatePDF}
                t={t}
                total={total}
                editingId={editingId}
                clearForm={clearForm}
                clients={clients}
                services={services}
            />
        )}
      </div>

      {/* --- NOVA BARRA DE NAVEGAÇÃO --- */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} t={t} />

    </div>
  )
}

export default App