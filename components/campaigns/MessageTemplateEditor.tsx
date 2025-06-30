'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  Info, 
  User, 
  AtSign, 
  Hash,
  MessageCircle,
  Copy
} from 'lucide-react';

interface MessageTemplateEditorProps {
  templates: string[];
  availableFields: string[];
  onChange: (templates: string[]) => void;
  title?: string;
  description?: string;
}

const getFieldIcon = (field: string) => {
  const iconMap: { [key: string]: any } = {
    'account': AtSign,
    'firstName': User,
    'lastName': User,
    'prenom': User,
    'nom': User,
    'username': AtSign,
    'followers': Hash,
  };
  return iconMap[field] || Hash;
};

const getFieldLabel = (field: string) => {
  const labelMap: { [key: string]: string } = {
    'account': 'Nom d\'utilisateur',
    'firstName': 'Prénom',
    'lastName': 'Nom',
    'prenom': 'Prénom',
    'nom': 'Nom',
    'username': 'Nom d\'utilisateur',
    'followers': 'Nombre de followers',
  };
  return labelMap[field] || field;
};

const getFieldDescription = (field: string) => {
  const descMap: { [key: string]: string } = {
    'account': 'Le nom d\'utilisateur Instagram',
    'firstName': 'Le prénom de l\'utilisateur',
    'lastName': 'Le nom de famille de l\'utilisateur',
    'prenom': 'Le prénom de l\'utilisateur',
    'nom': 'Le nom de famille de l\'utilisateur',
    'username': 'Le nom d\'utilisateur Instagram',
    'followers': 'Le nombre de followers de l\'utilisateur',
  };
  return descMap[field] || `Le champ ${field}`;
};

const defaultValues = [
  { key: 'monsieur', label: 'Monsieur' },
  { key: 'madame', label: 'Madame' },
  { key: 'ami', label: 'Ami(e)' },
  { key: 'utilisateur', label: 'Utilisateur' }
];

export default function MessageTemplateEditor({ 
  templates, 
  availableFields,
  onChange, 
  title = "Messages templates",
  description = "Créez des messages personnalisés avec des champs dynamiques"
}: MessageTemplateEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  const addTemplate = () => {
    onChange([...templates, '']);
  };

  const removeTemplate = (index: number) => {
    if (templates.length > 1) {
      const newTemplates = templates.filter((_, i) => i !== index);
      onChange(newTemplates);
      if (selectedTemplate >= newTemplates.length) {
        setSelectedTemplate(newTemplates.length - 1);
      }
    }
  };

  const updateTemplate = (index: number, value: string) => {
    const newTemplates = [...templates];
    newTemplates[index] = value;
    onChange(newTemplates);
  };

  const insertField = (field: string) => {
    const currentTemplate = templates[selectedTemplate] || '';
    const textarea = document.getElementById(`template-${selectedTemplate}`) as HTMLTextAreaElement;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = currentTemplate.substring(0, start) + field + currentTemplate.substring(end);
      updateTemplate(selectedTemplate, newValue);
      
      // Remettre le focus et la position du curseur
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + field.length, start + field.length);
      }, 0);
    } else {
      updateTemplate(selectedTemplate, currentTemplate + field);
    }
  };

  const copyExample = (example: string) => {
    navigator.clipboard.writeText(example);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Champs disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Champs de personnalisation disponibles
          </CardTitle>
          <CardDescription>
            Cliquez sur un champ pour l'insérer dans votre message
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableFields.length > 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableFields.map((field) => {
                const FieldIcon = getFieldIcon(field);
                return (
                  <div key={field} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FieldIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{getFieldLabel(field)}</div>
                        <div className="text-xs text-muted-foreground">{getFieldDescription(field)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{`{${field}}`}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => insertField(`{${field}}`)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Aucun champ personnalisé disponible. Importez un fichier CSV avec des colonnes supplémentaires 
                pour pouvoir personnaliser vos messages.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Valeurs par défaut */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Valeurs par défaut</CardTitle>
          <CardDescription>
            Utilisez la syntaxe {`{champ:valeur_par_defaut}`} pour définir une valeur de remplacement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Exemple :</strong> {`{prenom:monsieur}`} affichera le prénom de l'utilisateur, 
                ou "monsieur\" si le prénom n'est pas disponible.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {defaultValues.map((defaultValue) => (
                <Button
                  key={defaultValue.key}
                  variant="outline"
                  size="sm"
                  onClick={() => insertField(`{prenom:${defaultValue.key}}`)}
                  className="justify-start"
                >
                  <Copy className="h-3 w-3 mr-2" />
                  {defaultValue.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Messages templates</CardTitle>
          <CardDescription>
            Créez plusieurs variations de messages pour éviter la répétition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Onglets des templates */}
          <div className="flex flex-wrap gap-2">
            {templates.map((_, index) => (
              <div key={index} className="flex items-center">
                <Button
                  variant={selectedTemplate === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTemplate(index)}
                  className="rounded-r-none"
                >
                  Template {index + 1}
                </Button>
                {templates.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTemplate(index)}
                    className="rounded-l-none border-l-0 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addTemplate}
            >
              <Plus className="h-3 w-3 mr-1" />
              Ajouter
            </Button>
          </div>

          {/* Éditeur du template sélectionné */}
          <div className="space-y-2">
            <Label htmlFor={`template-${selectedTemplate}`}>
              Message template {selectedTemplate + 1}
            </Label>
            <Textarea
              id={`template-${selectedTemplate}`}
              placeholder="Salut {prenom:ami} ! J'ai vu ton profil et j'aimerais te parler de..."
              value={templates[selectedTemplate] || ''}
              onChange={(e) => updateTemplate(selectedTemplate, e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              Utilisez les champs de personnalisation ci-dessus pour rendre vos messages plus engageants
            </div>
          </div>

          {/* Aperçu */}
          {templates[selectedTemplate] && (
            <div className="space-y-2">
              <Label>Aperçu avec données d'exemple</Label>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  {templates[selectedTemplate]
                    .replace(/{prenom(?::([^}]+))?}/g, 'Marie')
                    .replace(/{nom(?::([^}]+))?}/g, 'Dubois')
                    .replace(/{firstName(?::([^}]+))?}/g, 'Marie')
                    .replace(/{lastName(?::([^}]+))?}/g, 'Dubois')
                    .replace(/{account(?::([^}]+))?}/g, 'marie_fitness')
                    .replace(/{username(?::([^}]+))?}/g, 'marie_fitness')
                    .replace(/{followers(?::([^}]+))?}/g, '1,234')
                  }
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exemples de messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exemples de messages efficaces</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm font-medium">Message de présentation :</div>
            <div className="p-3 bg-muted rounded text-sm font-mono">
              Salut {`{prenom:ami}`} ! 👋 J'ai découvert ton profil et j'adore ton contenu sur {`{account}`}. 
              Je pense qu'on pourrait collaborer ensemble !
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateTemplate(selectedTemplate, "Salut {prenom:ami} ! 👋 J'ai découvert ton profil et j'adore ton contenu sur {account}. Je pense qu'on pourrait collaborer ensemble !")}
            >
              Utiliser ce template
            </Button>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Message de networking :</div>
            <div className="p-3 bg-muted rounded text-sm font-mono">
              Hello {`{prenom:monsieur}`} ! Impressionnant tes {`{followers}`} followers ! 
              Je travaille dans le même domaine et j'aimerais échanger avec toi 🚀
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateTemplate(selectedTemplate, "Hello {prenom:monsieur} ! Impressionnant tes {followers} followers ! Je travaille dans le même domaine et j'aimerais échanger avec toi 🚀")}
            >
              Utiliser ce template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}