import zipfile
import xml.etree.ElementTree as ET
import sys
import os
import shutil

def extract_docx(docx_path, output_dir="extracted"):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    doc_name = os.path.splitext(os.path.basename(docx_path))[0]
    img_dir = os.path.join(output_dir, f"{doc_name}_images")
    if not os.path.exists(img_dir):
        os.makedirs(img_dir)

    text_content = []
    
    with zipfile.ZipFile(docx_path, 'r') as docx_zip:
        # Extract images
        for info in docx_zip.infolist():
            if info.filename.startswith('word/media/'):
                img_data = docx_zip.read(info.filename)
                img_name = os.path.basename(info.filename)
                with open(os.path.join(img_dir, img_name), 'wb') as f:
                    f.write(img_data)
        
        # Extract text
        if 'word/document.xml' in docx_zip.namelist():
            xml_content = docx_zip.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            # Namespace for Word XML
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            # Find all paragraphs
            for paragraph in tree.findall('.//w:p', namespaces):
                texts = [node.text for node in paragraph.findall('.//w:t', namespaces) if node.text]
                if texts:
                    text_content.append(''.join(texts))
                else:
                    text_content.append('') # Empty line for paragraph breaks
                    
    # Save extracted text to a temporary file for analysis
    txt_path = os.path.join(output_dir, f"{doc_name}.txt")
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(text_content))
        
    print(f"Extracted {docx_path} to {txt_path} and images to {img_dir}")

if __name__ == '__main__':
    for doc in ["Assignment 1.docx", "Assignment 2.docx", "Assignment 3.docx", "Assignment 4.docx"]:
        if os.path.exists(doc):
            extract_docx(doc)
