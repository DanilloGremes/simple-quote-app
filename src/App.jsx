import { useState, useEffect } from 'react'
import { jsPDF } from "jspdf"
import { auth, db, loginGoogle, logout } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('quote') // 'quote' ou 'company'

  // Dados do Orçamento
  const [formData, setFormData] = useState({
    clientName: '', clientPhone: '', clientEmail: '', clientAddress: '',
    sqft: '', pricePerSqft: '', materialType: 'LVP', baseboardType: 'Quarter Round', notes: ''
  })

  // Dados da Empresa (Contractor)
  const [companyData, setCompanyData] = useState({
    companyName: '', companyPhone: '', companyEmail: '', companyTerms: ''
  })

  // 1. Verificar se o usuário está logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // Se logou, busca os dados da empresa no banco
        const docRef = doc(db, "users", currentUser.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setCompanyData(docSnap.data().company || {})
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // 2. Salvar dados da empresa no banco
  const saveCompanyData = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), { 
        email: user.email,
        company: companyData 
      }, { merge: true })
      alert("Dados da empresa salvos!")
    } catch (e) {
      alert("Erro ao salvar: " + e.message)
    }
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

  // --- GERAR PDF ---
  const generatePDF = () => {
    const doc = new jsPDF()
    const dataAtual = new Date().toLocaleDateString()

    // Cabeçalho da Empresa (Se existir) ou Padrão
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.text(companyData.companyName.toUpperCase() || "ORÇAMENTO / QUOTE", 20, 20)
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(companyData.companyPhone || "", 20, 28)
    doc.text(companyData.companyEmail || "", 20, 33)

    doc.text(`Data: ${dataAtual}`, 150, 20)
    doc.text("Validade: 30 dias", 150, 25)

    doc.setLineWidth(0.5)
    doc.line(20, 40, 190, 40)

    // Cliente
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("PREPARADO PARA:", 20, 50)
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.text(`Cliente: ${formData.clientName}`, 20, 60)
    doc.text(`Endereço: ${formData.clientAddress}`, 20, 67)

    // Detalhes
    doc.setFillColor(240, 240, 240)
    doc.rect(20, 80, 170, 40, "F")

    doc.text(`Serviço: Instalação de ${formData.materialType}`, 25, 90)
    doc.text(`Área: ${formData.sqft} sqft`, 25, 100)
    doc.text(`Preço Unitário: $${formData.pricePerSqft}/sqft`, 110, 100)

    // Termos da Empresa
    doc.text("Observações:", 20, 135)
    const terms = companyData.companyTerms 
      ? companyData.companyTerms + "\n" + formData.notes 
      : formData.notes
    const splitNotes = doc.splitTextToSize(terms, 170)
    doc.text(splitNotes, 20, 145)

    // Total
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(`TOTAL: $${total.toFixed(2)}`, 140, 240)

    doc.save(`Orcamento_${formData.clientName}.pdf`)
  }

  // --- RENDERIZAÇÃO ---
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>

  // TELA DE LOGIN (Se não estiver logado)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-10 rounded-xl shadow-xl text-center max-w-md w-full">
          <h1 className="text-3xl font-bold mb-2">Simple Quote</h1>
          <p className="text-gray-500 mb-8">Faça orçamentos profissionais em segundos.</p>
          <button 
            onClick={loginGoogle}
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition flex justify-center items-center gap-2"
          >
            <span className="bg-white text-black text-xs font-bold px-1 rounded">G</span>
            Entrar com Google
          </button>
        </div>
      </div>
    )
  }

  // TELA DO APP (Se estiver logado)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4 font-sans text-gray-800">
      
      {/* Barra de Topo */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <div className="text-sm">Olá, <b>{user.displayName}</b></div>
        <button onClick={logout} className="text-xs text-red-500 hover:underline">Sair</button>
      </div>

      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        
        {/* Abas de Navegação */}
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('quote')}
            className={`flex-1 py-4 font-bold text-sm ${activeTab === 'quote' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            NOVO ORÇAMENTO
          </button>
          <button 
            onClick={() => setActiveTab('company')}
            className={`flex-1 py-4 font-bold text-sm ${activeTab === 'company' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            MINHA EMPRESA
          </button>
        </div>

        {/* CONTEÚDO: ABA EMPRESA */}
        {activeTab === 'company' && (
          <div className="p-8 space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Configurar Seus Dados</h2>
            <p className="text-sm text-gray-500 mb-4">Esses dados aparecerão no topo de todos os seus PDFs.</p>
            
            <input type="text" name="companyName" value={companyData.companyName} onChange={handleCompanyChange}
              className="w-full p-3 border rounded" placeholder="Nome da Sua Empresa" />
            
            <input type="text" name="companyPhone" value={companyData.companyPhone} onChange={handleCompanyChange}
              className="w-full p-3 border rounded" placeholder="Seu Telefone Comercial" />
            
            <input type="email" name="companyEmail" value={companyData.companyEmail} onChange={handleCompanyChange}
              className="w-full p-3 border rounded" placeholder="Seu Email Comercial" />
            
            <textarea name="companyTerms" value={companyData.companyTerms} onChange={handleCompanyChange}
              className="w-full p-3 border rounded" rows="4" placeholder="Seus Termos Padrão (Ex: 50% de entrada, validade 30 dias...)"></textarea>
            
            <button onClick={saveCompanyData} className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700">
              Salvar Configurações
            </button>
          </div>
        )}

        {/* CONTEÚDO: ABA ORÇAMENTO (O formulário antigo) */}
        {activeTab === 'quote' && (
          <div className="p-8 space-y-6 animate-fade-in">
            {/* ... (Mesmos campos de antes, simplificados aqui) ... */}
             <div className="grid grid-cols-2 gap-4">
                <input type="text" name="clientName" value={formData.clientName} onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border rounded" placeholder="Nome do Cliente" />
                <input type="text" name="clientAddress" value={formData.clientAddress} onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border rounded" placeholder="Endereço" />
             </div>
             
             <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                   <label className="text-xs font-bold">SQFT</label>
                   <input type="number" name="sqft" value={formData.sqft} onChange={handleChange}
                    className="w-full p-3 border rounded font-mono" placeholder="0" />
                </div>
                <div>
                   <label className="text-xs font-bold">Preço $</label>
                   <input type="number" name="pricePerSqft" value={formData.pricePerSqft} onChange={handleChange}
                    className="w-full p-3 border rounded font-mono" placeholder="0.00" />
                </div>
             </div>

             <div className="bg-black text-white p-4 rounded flex justify-between items-center mt-4">
                <div>
                  <p className="text-xs text-gray-400">TOTAL</p>
                  <p className="text-2xl font-bold">${total.toFixed(2)}</p>
                </div>
                <button onClick={generatePDF} className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200">
                  Baixar PDF
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App