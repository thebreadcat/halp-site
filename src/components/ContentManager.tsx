// components/ContentManager.tsx
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import DashboardLayout from './DashboardLayout';
import { supabase } from './supabaseClient';
import { fetchOrCreateEntity } from './supabaseUtils';
import * as colorPalettes from './defaultColorPallets';

interface ContentPart {
  id: number | null;
  title: string;
  layout: string;
  image: string;
  texts: string[];
}

interface Colors {
  color_background: string;
  color_dark: string;
  color_shadow: string;
  color_lightShadow: string;
  color_light: string;
  color_lightest: string;
  color_altBackground: string;
  color_altDark: string;
  color_altShadow: string;
  color_altLightShadow: string;
  color_altLight: string;
  color_altLightest: string;
  color_mainBackground: string;
  color_mainLightBackground: string;
  color_mainShadow: string;
  color_mainLightShadow: string;
  color_mainText: string;
  color_mainTextAlt: string;
}

const paletteMap: { [key: string]: Colors } = {
  breeze: colorPalettes.breezeColors,
  alert: colorPalettes.alertColors,
  warm: colorPalettes.warmColors,
  classroom: colorPalettes.classroomColors,
  earth: colorPalettes.earthColors,
  steel: colorPalettes.steelColors,
  dark: colorPalettes.darkColors,
  sunny: colorPalettes.sunnyColors,
  grow: colorPalettes.growColors,
  wave: colorPalettes.waveColors,
};

const mainDBTable = 'donations_content_parts';
const initialContentPart: ContentPart = {
  id: null,
  title: '',
  layout: 'SimpleSlideWithLeftImage',
  image: '',
  texts: ['']
};

interface UploadResponse {
  data: {
    path: string;
  } | null;
  error: {
    message: string;
  } | null;
}

interface PublicUrlResponse {
  data: {
    publicUrl: string;
  };
  error?: Error;
}

const defaultColors: Colors = {
  color_background: '#0049AD',
  color_dark: '#01193A',
  color_shadow: '#00347C',
  color_lightShadow: '#0056D3',
  color_light: '#0062F5',
  color_lightest: '#4A90E2',
  color_altBackground: '#0064FF',
  color_altDark: '#0037A8',
  color_altShadow: '#0049E5',
  color_altLightShadow: '#0078FF',
  color_altLight: '#008AFF',
  color_altLightest: '#339CFF',
  color_mainBackground: '#FFFFFF', // Added
  color_mainLightBackground: '#F0F4FA', // Added
  color_mainShadow: '#BCCCDC', // Added
  color_mainLightShadow: '#D9E2EC', // Added
  color_mainText: '#102A43',
  color_mainTextAlt: '#627D98',
};

interface ContentManagerProps {
  contentType: string;
  headerTitle: string;
  headerDescription: string;
}

const ContentManager: React.FC<ContentManagerProps> = ({ contentType, headerTitle, headerDescription }) => {
  const [contentParts, setContentParts] = useState<ContentPart[]>([]);
  const [colors, setColors] = useState<Colors>(defaultColors);
  const { address, isConnected } = useAccount();
  const [entityId, setEntityId] = useState<number | null>(null);

  useEffect(() => {
    async function checkWallet() {
      if (address && isConnected) {
        try {
          const id = await fetchOrCreateEntity(address);
          setEntityId(id);
        } catch (error) {
          console.error('Error fetching or creating entity:', error);
        }
      }
    }
    checkWallet();
  }, [address, isConnected]);

  useEffect(() => {
    const fetchContentParts = async () => {
      if (entityId === null) {
        return;
      }

      const { data, error } = await supabase
        .from(mainDBTable)
        .select('*')
        .eq('content_type', contentType)
        .eq('entity_id', entityId);

      if (error) {
        console.error('Error fetching content parts:', error);
      } else {
        setContentParts(data?.map((part: any) => ({
          id: part.id,
          title: part.title || '',
          layout: part.layout || 'SimpleSlideWithLeftImage',
          image: part.image || '',
          texts: part.texts || ['']
        })) || []);
      }
    };

    const fetchColors = async () => {
      if (entityId === null) {
        return;
      }

      const { data, error } = await supabase
        .from('donation_entities')
        .select('*')
        .eq('id', entityId)
        .single();

      if (error) {
        console.error('Error fetching colors:', error);
      } else {
        setColors(data ? { ...defaultColors, ...data } : defaultColors);
      }
    };

    fetchContentParts();
    fetchColors();
  }, [entityId, contentType]);

  const handleInputChange = (index: number, field: keyof ContentPart, value: any) => {
    const updatedContentParts = [...contentParts];
    updatedContentParts[index] = { ...updatedContentParts[index], [field]: value };
    setContentParts(updatedContentParts);
  };

  const handleTextChange = (contentIndex: number, textIndex: number, value: string) => {
    const updatedContentParts = [...contentParts];
    updatedContentParts[contentIndex].texts[textIndex] = value;
    setContentParts(updatedContentParts);
  };

  const addTextBlock = (index: number) => {
    const updatedContentParts = [...contentParts];
    updatedContentParts[index].texts.push('');
    setContentParts(updatedContentParts);
  };

  const removeTextBlock = (contentIndex: number, textIndex: number) => {
    const updatedContentParts = [...contentParts];
    updatedContentParts[contentIndex].texts.splice(textIndex, 1);
    setContentParts(updatedContentParts);
  };

  const handleImageUpload = async (index: number, file: File | null) => {
    if (!file) {
      console.warn('No file selected for upload.');
      return;
    }

    const { data, error }: UploadResponse = await supabase.storage
      .from('story-images')
      .upload(`public/${file.name}`, file);

    if (error || !data) {
      console.error('Error uploading image:', error?.message);
      return;
    }

    const { data: publicUrl } = supabase.storage.from('story-images').getPublicUrl(data.path);

    handleInputChange(index, 'image', publicUrl);
  };

  const addContentPart = () => {
    setContentParts([...contentParts, { ...initialContentPart }]);
  };

  const handleSave = async (index: number) => {
    const contentPart = contentParts[index];
    const isEditing = contentPart.id !== null;

    try {
      if (isEditing) {
        const { data, error } = await supabase
          .from(mainDBTable)
          .update({
            layout: contentPart.layout,
            title: contentPart.title,
            image: contentPart.image,
            texts: contentPart.texts,
            content_type: contentType
          })
          .eq('id', contentPart.id)
          .select('*');

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setContentParts(contentParts.map(part => part.id === contentPart.id ? data[0] : part));
        }
      } else {
        const { data, error } = await supabase
          .from(mainDBTable)
          .insert([{
            entity_id: entityId,
            layout: contentPart.layout,
            title: contentPart.title,
            image: contentPart.image,
            texts: contentPart.texts,
            content_type: contentType
          }])
          .select('*');

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setContentParts(contentParts.map((part, i) => i === index ? { ...data[0], id: data[0].id } : part));
        }
      }
    } catch (error) {
      console.error('Error saving content part:', error);
    }
  };

  const handleDelete = async (index: number) => {
    const contentPart = contentParts[index];
    if (contentPart.id) {
      const { error } = await supabase
        .from(mainDBTable)
        .delete()
        .eq('id', contentPart.id);

      if (error) {
        console.error('Error deleting content part:', error);
      }
    }

    setContentParts(contentParts.filter((_, i) => i !== index));
  };

  const handleColorChange = async (paletteName: string) => {
    const newColors = paletteMap[paletteName];
    if (!newColors) {
      console.error('Palette not found:', paletteName);
      return;
    }

    setColors(newColors);

    if (entityId === null) {
      return;
    }

    try {
      const { error } = await supabase
        .from('donation_entities')
        .update(newColors)
        .eq('id', entityId);

      if (error) {
        console.error('Error updating colors:', error);
      }
    } catch (error) {
      console.error('Error updating colors:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="container">
        <div className="innerHeader all-purple">
          <h1 className="all-purple">{headerTitle}</h1>
          <p className="description">
            {headerDescription}
          </p>
        </div>
        <div className="divider"></div>
        <div className="pick-a-look">
          <div className="instructions">
            <h3 className="all-dark-purple">1. Pick a Look</h3>
            <small style={{display: 'block', marginBottom: '1rem'}}>Note: Changing this here will change it for all of your donation widgets</small>
          </div>
          <div className="pick-a-look-options">
            {Object.keys(paletteMap).map(palette => (
              <div
                key={palette}
                className={`pick-a-look-option ${palette}`}
                onClick={() => handleColorChange(palette)}
              >
                {palette.charAt(0).toUpperCase() + palette.slice(1)}
              </div>
            ))}
          </div>
        </div>
        <div className="divider"></div>
        <div className="add-your-story">
          <div className="instructions">
            <h3 className="all-dark-purple">2. Add your Story</h3>
            <p>Add your content by entering it into the cards below.</p>
          </div>
          <div className="card-creator">

          </div>
        </div>
        {contentParts.map((contentPart, index) => (
          <div key={index} className="content-part">
            <div className="columns tight apart">
              <div className="card-half small">
                <div className="form-item alt-bottom-margin">
                  <label className="form-label all-dark-purple">Layout</label>
                  <select
                    value={contentPart.layout}
                    onChange={(e) => handleInputChange(index, 'layout', e.target.value)}
                    className="form-input"
                  >
                    <option value="SimpleSlideWithLeftImage">Simple Slide with Left Image</option>
                    <option value="SimpleSlideWithCenterImage">Simple Slide with Center Image</option>
                    {/* Add more layout options here */}
                  </select>
                </div>
                <div className="form-item alt-bottom-margin">
                  <label className="form-label all-dark-purple">Upload Image</label>
                  <input
                    type="file"
                    className="form-input"
                    onChange={(e) => handleImageUpload(index, e.target.files?.[0] || null)}
                  />
                </div>
                <h3 className="all-dark-purple">Content</h3>
                <div className="form-item text-block alt-bottom-margin">
                  <input
                    type="text"
                    value={contentPart.title}
                    placeholder="title"
                    onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                    className="form-input"
                  />
                </div>

                {contentPart.texts.map((text, textIndex) => (
                  <div key={textIndex} className="form-item alt-bottom-margin">
                    <div className="text-block">
                      <input
                        type="text"
                        value={text}
                        placeholder={`Text Block ${textIndex + 1}`}
                        onChange={(e) => handleTextChange(index, textIndex, e.target.value)}
                        className="form-input"
                      />
                      <div style={{ display: 'flex' }} onClick={() => removeTextBlock(index, textIndex)}>
                        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="15" cy="15" r="13.5" stroke="#FF3F3F" strokeWidth="3" />
                          <path d="M9 15L21 15" stroke="#FF3F3F" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="button-stack">
                  <button onClick={() => addTextBlock(index)} className="btn btn-smaller secondary">
                    Add Text Block
                  </button>
                  <button onClick={() => handleSave(index)} className="btn btn-small secondary">
                    {contentPart.id ? 'Update' : 'Save'}
                  </button>
                  {contentPart.id && (
                    <button onClick={() => handleDelete(index)} className="btn btn-small grey">
                      Delete
                    </button>
                  )}
                </div>
                <div className="button-stack">
                  <button onClick={() => addContentPart()} className="btn btn-smaller">
                    Add New Slide
                  </button>
                </div>
              </div>
              <div className="card-half big bigger preview">
                <h2 className="all-dark-purple">Preview</h2>
                <div className="preview-box" style={{ backgroundColor: colors.color_background }}>
                  <div className="preview-content" style={{ backgroundColor: colors.color_shadow }}>
                    <div className="preview-text" style={{ color: colors.color_altLight }}>
                      <span className="preview-title" style={{ fontSize: '2rem' }}>
                        {contentPart.title || 'Slide Title'}
                      </span>
                      <div className="preview-text-blocks">
                        {contentPart.texts.map((text, textIndex) => (
                          <span key={textIndex} className="preview-text-block" style={{ color: colors.color_mainText || defaultColors['color_mainText'] }}>
                            {text || `Sample text line ${textIndex + 1}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ContentManager;
