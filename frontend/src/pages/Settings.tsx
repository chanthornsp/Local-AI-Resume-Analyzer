import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_PROMPT_TEMPLATE = `**INSTRUCTIONS:**
Analyze this CV and provide a structured assessment. Extract information EXACTLY in this format:

Name: [candidate's full name]
Email: [email address if found, or "Not provided"]
Phone: [phone number if found, or "Not provided"]
Match Score: [number from 0-100 based on job fit]
Experience Years: [total years of relevant experience]
Matched Skills: [comma-separated list of skills from CV that match job requirements]
Missing Skills: [comma-separated list of required skills NOT found in CV]
Education: [highest degree and field, e.g., "BS Computer Science"]
Key Strengths:
- [strength 1 - specific achievement or skill]
- [strength 2]
- [strength 3]
Concerns:
- [concern 1 - gaps or missing qualifications]
- [concern 2]
Summary: [2-3 sentence overall assessment of candidate fit]


**SCORING GUIDELINES:**
- 85-100: Excellent match, exceeds requirements
- 70-84: Good match, meets most requirements
- 50-69: Average match, meets basic requirements
- 0-49: Below requirements, significant gaps

Be specific and honest. Base the score on actual qualifications, not potential.`;

const PROMPT_PRESETS: Record<string, { label: string; prompt: string }> = {
    default: {
        label: "Twist Default (Standard)",
        prompt: DEFAULT_PROMPT_TEMPLATE
    },
    senior: {
        label: "Senior/Lead Role Pattern",
        prompt: `**INSTRUCTIONS:**
Analyze this CV for a SENIOR/LEADERSHIP position. Focus on system design, mentorship, and business impact. Extract information EXACTLY in this format:

Name: [candidate's full name]
Email: [email address]
Phone: [phone number]
Match Score: [0-100, be strict - look for proven leadership]
Experience Years: [total years]
Matched Skills: [technical and leadership skills]
Missing Skills: [critical leadership or scale gaps]
Education: [degrees]
Key Strengths:
- [Architecture/Design capability]
- [Team Mentorship/Leadership]
- [Business Impact/ROI]
Concerns:
- [Lack of strategic scope]
- [Too operational/tactical]
Summary: [Assessment of candidate's readiness for high-level responsibility]

**SCORING GUIDELINES:**
- 90-100: Transformational Leader
- 75-89: Solid Senior Application Leader
- 0-74: Lack of needed seniority

Be critical about specific senior-level impact.`
    },
    creative: {
        label: "Creative / Soft Skills",
        prompt: `**INSTRUCTIONS:**
Analyze this CV with a focus on CULTURE FIT and SOFT SKILLS. Extract information EXACTLY in this format:

Name: [candidate's full name]
Email: [email address]
Phone: [phone number]
Match Score: [0-100 based on culture potential]
Experience Years: [total years]
Matched Skills: [soft skills and core competencies]
Missing Skills: [culture/communication gaps]
Education: [degrees]
Key Strengths:
- [Communication style]
- [Collaboration evidence]
- [Adaptability/Growth mindset]
Concerns:
- [Red flags in communication]
- [Rigidness]
Summary: [Assessment of how well this person would fit a dynamic team]

**SCORING GUIDELINES:**
- 80-100: Great Cultural Add
- 60-79: Acceptable
- 0-59: Potential Friction

Focus on the 'human' side of the resume.`
    }
};

export function SettingsPage() {
    const navigate = useNavigate();
    const { data, isLoading } = useSettings();
    const { mutate: updateSettings, isPending: isSaving } = useUpdateSettings();
    
    const [model, setModel] = useState('');
    const [prompt, setPrompt] = useState('');
    const [temp, setTemp] = useState(0.2);
    
    useEffect(() => {
        if (data?.settings) {
            setModel(data.settings.ollama_model || 'llama3');
            setPrompt(data.settings.system_prompt || '');
            setTemp(data.settings.temperature !== undefined ? data.settings.temperature : 0.2);
        }
    }, [data]);
    
    const handleSave = () => {
        updateSettings({
            ollama_model: model,
            system_prompt: prompt,
            temperature: temp
        }, {
            onSuccess: () => toast.success('Settings saved successfully'),
            onError: (err: any) => toast.error('Failed to save settings: ' + (err.message || 'Unknown error'))
        });
    };

    const applyPreset = (key: string) => {
        if (PROMPT_PRESETS[key]) {
             setPrompt(PROMPT_PRESETS[key].prompt);
             toast.info(`Loaded "${PROMPT_PRESETS[key].label}" preset`);
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
     <div className="container mx-auto px-6 py-8 max-w-4xl animate-in fade-in duration-300">
       {/* Header */}
       <div className="flex items-center gap-4 mb-8">
         <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
         </Button>
         <div>
            <h1 className="text-2xl font-bold">AI Configuration</h1>
            <p className="text-muted-foreground">Manage Local AI model and analysis behavior</p>
         </div>
       </div>
       
       <div className="space-y-6">
          <Card>
             <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>AI Model Selection</CardTitle>
                        <CardDescription>Select which Local AI model to use for analysis</CardDescription>
                    </div>
                    {data?.ollama_connected ? (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Ollama Connected
                        </div>
                    ) : (
                         <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            Ollama Offline
                        </div>
                    )}
                </div>
             </CardHeader>
             <CardContent>
                <div className="space-y-4">
                   <div className="grid gap-2">
                      <Label>Active Model</Label>
                      {data?.available_models && data.available_models.length > 0 ? (
                          <Select value={model} onValueChange={setModel}>
                            <SelectTrigger className="w-full md:w-[300px]">
                               <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                               {data.available_models.map(m => (
                                  <SelectItem key={m} value={m}>{m}</SelectItem>
                               ))}
                            </SelectContent>
                          </Select>
                      ) : (
                          <div className="p-4 border rounded bg-slate-50 text-sm text-muted-foreground">
                              No models found. Please run `ollama pull llama3` in your terminal.
                          </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        The list shows all models available in your local Ollama library.
                      </p>
                   </div>
                </div>
             </CardContent>
          </Card>

          <Card>
             <CardHeader>
                <CardTitle>Model Parameters</CardTitle>
                <CardDescription>Fine-tune how the AI processes information</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="space-y-4">
                   <div className="space-y-3">
                       <div className="flex items-center justify-between">
                           <Label htmlFor="temp-slider">Temperature: <span className="font-mono text-primary font-bold ml-2">{temp}</span></Label>
                       </div>
                       <input 
                          id="temp-slider"
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.05"
                          value={temp}
                          onChange={(e) => setTemp(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                       />
                       <div className="flex justify-between text-xs text-muted-foreground px-1">
                           <span>Precise (0.0)</span>
                           <span>Balanced (0.5)</span>
                           <span>Creative (1.0)</span>
                       </div>
                       <p className="text-xs text-muted-foreground border-l-2 border-blue-200 pl-2">
                           Recommended: <strong>0.1 - 0.3</strong> for resume analysis. Higher values increase randomness and may cause parsing errors.
                       </p>
                   </div>
                </div>
             </CardContent>
          </Card>
          
          <Card>
             <CardHeader>
                <div className="flex items-center justify-between">
                     <div>
                        <CardTitle>Prompt Tuning</CardTitle>
                        <CardDescription>Customize the analysis instructions</CardDescription>
                     </div>
                     <div className="w-[200px]">
                        <Select onValueChange={applyPreset}>
                            <SelectTrigger>
                                <SelectValue placeholder="Load Preset..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(PROMPT_PRESETS).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                     </div>
                </div>
             </CardHeader>
             <CardContent>
                <div className="grid gap-2">
                   <Label>System Instructions</Label>
                   <Textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Enter custom instructions..."
                      className="min-h-[400px] font-mono text-sm leading-relaxed"
                   />
                   <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md border border-yellow-200 text-sm">
                      <strong>⚠️ Important Parser Warning:</strong>
                      <p className="mt-1">
                          The system relies on specific keywords to extract data. Do NOT remove or rename the following headers: 
                          <span className="font-mono mx-1">Name:, Match Score:, Experience Years:, Matched Skills:, Missing Skills:, Key Strengths:</span>
                          If you change these, the analysis will fail to display correctly.
                      </p>
                   </div>
                </div>
             </CardContent>
          </Card>
          
          <div className="flex justify-end gap-4 sticky bottom-6 bg-white/80 backdrop-blur p-4 border rounded-lg shadow-lg">
              <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                 {isSaving ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                     </>
                 ) : (
                     <>
                        <Save className="mr-2 h-4 w-4" /> Save Configuration
                     </>
                 )}
              </Button>
          </div>
       </div>
     </div>
    );
}
