import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Organization, Exam, CertificateTemplate } from '../types';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

const Admin: React.FC = () => {
    const { organizations, activeOrg, setActiveOrgById, updateActiveOrg, isLoading } = useAppContext();
    const [editableOrg, setEditableOrg] = useState<Organization | null>(null);

    useEffect(() => {
        // Deep copy to prevent direct mutation of context state
        if (activeOrg) {
            setEditableOrg(JSON.parse(JSON.stringify(activeOrg)));
        }
    }, [activeOrg]);

    const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editableOrg) return;
        setEditableOrg({ ...editableOrg, [e.target.name]: e.target.value });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editableOrg) return;
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file (PNG, JPG, etc.).");
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error("File is too large. Please select an image under 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setEditableOrg({ ...editableOrg, logo: reader.result });
                toast.success("Logo preview updated. Don't forget to save changes.");
            }
        };
        reader.onerror = () => {
            toast.error("Failed to read the logo file.");
        };
        reader.readAsDataURL(file);
    };

    const handleExamChange = (examId: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editableOrg) return;
        const { name, value } = e.target;
        const updatedExams = editableOrg.exams.map(exam => {
            if (exam.id === examId) {
                return { ...exam, [name]: name === 'price' || name === 'numberOfQuestions' || name === 'passScore' ? parseFloat(value) || 0 : value };
            }
            return exam;
        });
        setEditableOrg({ ...editableOrg, exams: updatedExams });
    };

    const handleCertTemplateChange = (templateId: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editableOrg) return;
        const { name, value } = e.target;
        const updatedTemplates = editableOrg.certificateTemplates.map(template => {
            if (template.id === templateId) {
                return { ...template, [name]: value };
            }
            return template;
        });
        setEditableOrg({ ...editableOrg, certificateTemplates: updatedTemplates });
    };

    const handleSaveChanges = () => {
        if (editableOrg) {
            updateActiveOrg(editableOrg);
            toast.success(`${editableOrg.name} configuration saved!`);
        }
    };

    if (isLoading || !editableOrg) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Admin Customization Panel</h1>

            {/* Organization Selector */}
            <div className="mb-8 p-4 border rounded-lg bg-slate-50">
                <label htmlFor="org-select" className="block text-lg font-semibold text-slate-700 mb-2">Select Organization to Edit</label>
                <select
                    id="org-select"
                    value={activeOrg?.id || ''}
                    onChange={(e) => setActiveOrgById(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                >
                    {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                </select>
            </div>
            
            {/* Organization Details */}
            <div className="space-y-6">
                <div className="p-6 border rounded-lg">
                    <h2 className="text-2xl font-semibold text-cyan-700 mb-4">Organization Details</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-medium text-slate-600">Organization Name</label>
                            <input type="text" name="name" value={editableOrg.name} onChange={handleOrgChange} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block font-medium text-slate-600">Website URL</label>
                            <input type="text" name="website" value={editableOrg.website} onChange={handleOrgChange} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div className="md:col-span-2">
                             <label className="block font-medium text-slate-600">Organization Logo</label>
                             <div className="flex items-center space-x-4 mt-2">
                                <img src={editableOrg.logo} alt="Current Logo" className="h-16 w-16 object-contain border rounded-md p-1 bg-white shadow-sm" />
                                <input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/gif"
                                    onChange={handleLogoUpload}
                                    className="block w-full text-sm text-slate-500
                                               file:mr-4 file:py-2 file:px-4
                                               file:rounded-full file:border-0
                                               file:text-sm file:font-semibold
                                               file:bg-cyan-50 file:text-cyan-700
                                               hover:file:bg-cyan-100"
                                />
                             </div>
                        </div>
                    </div>
                </div>

                {/* Exams */}
                <div>
                    <h2 className="text-2xl font-semibold text-cyan-700 mb-4">Exams</h2>
                    {editableOrg.exams.map(exam => (
                        <div key={exam.id} className="p-6 border rounded-lg mb-4 bg-slate-50">
                             <h3 className="text-xl font-bold text-slate-700 mb-4">{exam.name}</h3>
                             <div className="grid md:grid-cols-2 gap-4">
                                 <div><label className="block font-medium">Exam Name</label><input type="text" name="name" value={exam.name} onChange={(e) => handleExamChange(exam.id, e)} className="w-full p-2 border rounded-md" /></div>
                                 <div className="md:col-span-2"><label className="block font-medium">Description</label><textarea name="description" value={exam.description} onChange={(e) => handleExamChange(exam.id, e)} className="w-full p-2 border rounded-md" /></div>
                                 <div><label className="block font-medium">Price</label><input type="number" name="price" value={exam.price} onChange={(e) => handleExamChange(exam.id, e)} className="w-full p-2 border rounded-md" /></div>
                                 <div><label className="block font-medium">Number of Questions</label><input type="number" name="numberOfQuestions" value={exam.numberOfQuestions} onChange={(e) => handleExamChange(exam.id, e)} className="w-full p-2 border rounded-md" /></div>
                                 <div><label className="block font-medium">Passing Score (%)</label><input type="number" name="passScore" value={exam.passScore} onChange={(e) => handleExamChange(exam.id, e)} className="w-full p-2 border rounded-md" /></div>
                                 <div className="md:col-span-2"><label className="block font-medium">Question Source (Google Sheet URL)</label><input type="text" name="questionSourceUrl" value={exam.questionSourceUrl} onChange={(e) => handleExamChange(exam.id, e)} className="w-full p-2 border rounded-md" /></div>
                             </div>
                        </div>
                    ))}
                </div>

                {/* Certificate Templates */}
                <div>
                    <h2 className="text-2xl font-semibold text-cyan-700 mb-4">Certificate Templates</h2>
                    {editableOrg.certificateTemplates.map(template => (
                         <div key={template.id} className="p-6 border rounded-lg bg-slate-50">
                             <h3 className="text-xl font-bold text-slate-700 mb-4">Template: {template.title}</h3>
                             <div className="grid md:grid-cols-2 gap-4">
                                 <div><label className="block font-medium">Certificate Title</label><input type="text" name="title" value={template.title} onChange={(e) => handleCertTemplateChange(template.id, e)} className="w-full p-2 border rounded-md" /></div>
                                 <div className="md:col-span-2"><label className="block font-medium">Body Text (use {'{finalScore}'})</label><textarea name="body" value={template.body} onChange={(e) => handleCertTemplateChange(template.id, e)} className="w-full p-2 border rounded-md" /></div>
                                 <div><label className="block font-medium">Signature 1 Name</label><input type="text" name="signature1Name" value={template.signature1Name} onChange={(e) => handleCertTemplateChange(template.id, e)} className="w-full p-2 border rounded-md" /></div>
                                 <div><label className="block font-medium">Signature 1 Title</label><input type="text" name="signature1Title" value={template.signature1Title} onChange={(e) => handleCertTemplateChange(template.id, e)} className="w-full p-2 border rounded-md" /></div>
                                 <div><label className="block font-medium">Signature 2 Name</label><input type="text" name="signature2Name" value={template.signature2Name} onChange={(e) => handleCertTemplateChange(template.id, e)} className="w-full p-2 border rounded-md" /></div>
                                 <div><label className="block font-medium">Signature 2 Title</label><input type="text" name="signature2Title" value={template.signature2Title} onChange={(e) => handleCertTemplateChange(template.id, e)} className="w-full p-2 border rounded-md" /></div>
                             </div>
                         </div>
                    ))}
                </div>

                {/* Save Button */}
                <div className="mt-8 text-right">
                    <button
                        onClick={handleSaveChanges}
                        className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition"
                    >
                        Save All Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Admin;
